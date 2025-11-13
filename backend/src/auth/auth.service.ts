import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { N8NService } from '../n8n/n8n.service';
import { EmailService } from '../common/services/email.service';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { Plan } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private n8nService: N8NService,
    private emailService: EmailService,
  ) {}

  /**
   * Generate unique subdomain from company name
   */
  async generateSubdomain(companyName: string): Promise<string> {
    let subdomain = slugify(companyName, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    // Ensure alphanumeric + hyphens only (3-63 chars)
    if (!/^[a-z0-9-]{3,63}$/.test(subdomain)) {
      throw new BadRequestException('Invalid company name for subdomain');
    }

    // Check if subdomain is already taken
    if (await this.subdomainExists(subdomain)) {
      throw new BadRequestException(
        `The subdomain "${subdomain}" is already taken. Please choose a different company name.`,
      );
    }

    return subdomain;
  }

  /**
   * Check if subdomain exists
   */
  private async subdomainExists(subdomain: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    return !!tenant;
  }

  /**
   * Check if email exists
   */
  private async emailExists(email: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { email },
    });
    return !!tenant;
  }

  /**
   * Register new tenant (Multi-Bot Architecture)
   * Step 1: Create account with email/password (NO subdomain yet)
   * User will verify email and choose subdomain later
   */
  async register(dto: RegisterDto) {
    // 1. Check if email already exists
    if (await this.emailExists(dto.email)) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hash password (bcrypt 12 rounds)
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 3. Generate email verification token
    const verificationToken = nanoid(32);

    // 4. Create tenant WITHOUT subdomain (will be set after verification)
    const apiKey = `sk_${randomBytes(32).toString('hex')}`;

    const tenant = await this.prisma.tenant.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        country: dto.country,
        authProvider: 'email',
        emailVerified: false, // User must verify email first
        status: 'PENDING', // Will be ACTIVE after email verification
        // NO name or subdomain yet - user will choose after verification
        name: '', // Temporary empty, will be set with subdomain
        subdomain: `temp_${nanoid(10)}`, // Temporary, will be updated
        apiKey,
        config: {}, // Empty config for now
      },
    });

    // 5. Store verification token (you can use a separate table or JWT)
    // For simplicity, we'll encode it in JWT for now
    const verificationJwt = this.jwtService.sign(
      { sub: tenant.id, email: tenant.email, type: 'email_verification' },
      { expiresIn: '24h' },
    );

    this.logger.log(
      `Tenant registered, waiting for verification: ${tenant.id} (${tenant.email})`,
    );

    // Send verification email via Brevo
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5176';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationJwt}`;

    try {
      await this.emailService.sendVerificationEmail(tenant.email, verificationUrl);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${tenant.email}`, error);
      // Don't fail registration if email fails
      this.logger.log(`[FALLBACK] Verification link: ${verificationUrl}`);
    }

    return {
      message: 'Registration successful! Please check your email to verify your account.',
      email: tenant.email,
      requiresVerification: true,
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'email_verification') {
        throw new BadRequestException('Invalid verification token');
      }

      const tenant = await this.prisma.tenant.findUnique({
        where: { id: decoded.sub },
      });

      if (!tenant) {
        throw new BadRequestException('Tenant not found');
      }

      if (tenant.emailVerified) {
        throw new BadRequestException('Email already verified');
      }

      // Mark email as verified and activate account
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          emailVerified: true,
          status: 'ACTIVE', // Activate account after verification
        },
      });

      this.logger.log(`Email verified for tenant ${tenant.id}`);

      // Generate auth token for immediate login after verification
      const authToken = this.jwtService.sign({
        sub: tenant.id,
        email: tenant.email,
        subdomain: tenant.subdomain,
        type: 'auth',
      });

      return {
        success: true,
        message: 'Email verified successfully. Please choose your dashboard subdomain.',
        tenantId: tenant.id,
        token: authToken, // Auto-login after verification
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  /**
   * Set subdomain after email verification
   */
  async setSubdomain(tenantId: string, companyName: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (!tenant.emailVerified) {
      throw new BadRequestException('Please verify your email first');
    }

    if (tenant.subdomain && !tenant.subdomain.startsWith('temp_')) {
      throw new BadRequestException('Subdomain already set');
    }

    // Generate subdomain from company name
    const subdomain = await this.generateSubdomain(companyName);

    // Update tenant with real subdomain and company name
    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: companyName,
        subdomain,
      },
    });

    // Generate login token
    const token = this.jwtService.sign({
      sub: updatedTenant.id,
      email: updatedTenant.email,
      subdomain: updatedTenant.subdomain,
    });

    this.logger.log(`Subdomain set for tenant ${tenantId}: ${subdomain}`);

    return {
      token,
      tenant: {
        id: updatedTenant.id,
        email: updatedTenant.email,
        fullName: updatedTenant.fullName,
        companyName: updatedTenant.name,
        subdomain: updatedTenant.subdomain,
        dashboardUrl: `https://${subdomain}.simplechat.bot`,
      },
    };
  }

  /**
   * Login existing tenant
   */
  async login(dto: LoginDto) {
    // 1. Find tenant by email
    const tenant = await this.prisma.tenant.findUnique({
      where: { email: dto.email },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if tenant uses email/password auth
    if (!tenant.passwordHash) {
      throw new UnauthorizedException('Please login with Google');
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, tenant.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Update last login
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { lastLogin: new Date() },
    });

    // 5. Generate JWT token
    const token = this.jwtService.sign({
      sub: tenant.id,
      email: tenant.email,
      subdomain: tenant.subdomain,
    });

    return {
      token,
      tenant: {
        id: tenant.id,
        email: tenant.email,
        fullName: tenant.fullName,
        companyName: tenant.name,
        subdomain: tenant.subdomain,
        dashboardUrl: `https://${tenant.subdomain}.simplechat.bot`,
      },
    };
  }

  /**
   * Request password reset (sends reset token via email)
   */
  async forgotPassword(email: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { email },
    });

    // Don't reveal if email exists or not (security best practice)
    if (!tenant) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return {
        message: 'If an account exists with this email, you will receive a password reset link.',
      };
    }

    // Generate password reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { sub: tenant.id, email: tenant.email, type: 'password_reset' },
      { expiresIn: '1h' },
    );

    this.logger.log(`Password reset requested for: ${email}`);

    // Send password reset email via Brevo
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5176'}/reset-password?token=${resetToken}`;

    try {
      await this.emailService.sendPasswordResetEmail(tenant.email, resetUrl);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${tenant.email}`, error);
      // Don't fail the request if email fails
      this.logger.log(`[FALLBACK] Password reset link: ${resetUrl}`);
    }

    return {
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'password_reset') {
        throw new BadRequestException('Invalid reset token');
      }

      const tenant = await this.prisma.tenant.findUnique({
        where: { id: decoded.sub },
      });

      if (!tenant) {
        throw new BadRequestException('Tenant not found');
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { passwordHash },
      });

      this.logger.log(`Password reset successful for tenant: ${tenant.id}`);

      return {
        success: true,
        message: 'Password reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  /**
   * Resend email verification link
   */
  async resendVerificationEmail(email: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { email },
    });

    if (!tenant) {
      throw new BadRequestException('Email not found');
    }

    if (tenant.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationJwt = this.jwtService.sign(
      { sub: tenant.id, email: tenant.email, type: 'email_verification' },
      { expiresIn: '24h' },
    );

    this.logger.log(`Verification email resent for: ${email}`);

    // Send verification email via Brevo
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5176'}/verify-email?token=${verificationJwt}`;

    try {
      await this.emailService.sendVerificationEmail(tenant.email, verifyUrl);
    } catch (error) {
      this.logger.error(`Failed to resend verification email to ${tenant.email}`, error);
      // Don't fail the request if email fails
      this.logger.log(`[FALLBACK] Verification link: ${verifyUrl}`);
    }

    return {
      message: 'Verification email sent successfully.',
    };
  }

  /**
   * Validate tenant by ID (used by JWT strategy)
   */
  async validateTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        email: true,
        fullName: true,
        name: true,
        subdomain: true,
        status: true,
      },
    });

    if (!tenant || tenant.status !== 'ACTIVE') {
      return null;
    }

    return tenant;
  }
}
