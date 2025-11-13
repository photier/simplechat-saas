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

    // Ensure uniqueness
    let counter = 1;
    const originalSubdomain = subdomain;

    while (await this.subdomainExists(subdomain)) {
      subdomain = `${originalSubdomain}${counter}`;
      counter++;
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
        emailVerified: true, // Auto-verify since email service not configured
        status: 'ACTIVE',
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

    // TODO: Send verification email
    // For now, just log it
    this.logger.log(
      `[EMAIL] Verification link: http://localhost:3000/verify-email?token=${verificationJwt}`,
    );

    // Auto-verify and login for now (email service not configured)
    // Generate JWT auth token for immediate login
    const authToken = this.jwtService.sign({
      sub: tenant.id,
      email: tenant.email,
      subdomain: tenant.subdomain,
      type: 'auth',
    });

    return {
      message: 'Registration successful! Setting up your account...',
      email: tenant.email,
      token: authToken, // Auto-login token
      verificationToken: verificationJwt, // For testing only
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

      // Mark email as verified but don't set subdomain yet
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { emailVerified: true },
      });

      this.logger.log(`Email verified for tenant ${tenant.id}`);

      return {
        success: true,
        message: 'Email verified successfully. Please choose your dashboard subdomain.',
        tenantId: tenant.id,
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
