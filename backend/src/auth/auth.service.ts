import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { Plan } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
   * Register new tenant
   */
  async register(dto: RegisterDto) {
    // 1. Check if email already exists
    if (await this.emailExists(dto.email)) {
      throw new ConflictException('Email already registered');
    }

    // 2. Generate subdomain
    const subdomain = await this.generateSubdomain(dto.companyName);

    // 3. Generate chatId and apiKey
    const chatId = `tenant_${nanoid(10)}`;
    const apiKey = nanoid(32);

    // 4. Hash password (bcrypt 12 rounds)
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 5. Calculate trial end date (14 days)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // 6. Create tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.companyName,
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        country: dto.country,
        subdomain,
        chatId,
        apiKey,
        plan: dto.plan,
        authProvider: 'email',
        subscriptionStatus: 'trialing',
        trialEndsAt,
        widgetType: dto.plan === Plan.PREMIUM ? 'PREMIUM' : 'NORMAL',
        config: {
          mainColor: '#4c86f0',
          titleOpen: 'Chat with us',
          introMessage: 'Hello! How can I help you today?',
          placeholder: 'Type your message...',
          desktopHeight: 600,
          desktopWidth: 380,
        },
      },
    });

    // 7. Create default configurations
    await Promise.all([
      // AI Config
      this.prisma.aIConfig.create({
        data: {
          tenantId: tenant.id,
          aiInstructions: 'You are a helpful customer support assistant.',
          aiModel: 'gpt-4o',
          aiTemperature: 0.7,
          aiMaxTokens: 500,
        },
      }),

      // Integration (if Premium)
      dto.plan === Plan.PREMIUM &&
        this.prisma.integration.create({
          data: {
            tenantId: tenant.id,
            telegramMode: 'managed',
            usesSharedBot: false,
            businessHoursEnabled: false,
            timezone: 'Europe/Istanbul',
          },
        }),
    ]);

    // 8. Generate JWT token
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
        plan: tenant.plan,
        trialEndsAt: tenant.trialEndsAt,
        urls: {
          dashboard: `https://${subdomain}.simplechat.bot`,
          widget:
            dto.plan === Plan.PREMIUM
              ? `https://${subdomain}.p.simplechat.bot`
              : `https://${subdomain}.w.simplechat.bot`,
        },
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
        plan: tenant.plan,
        trialEndsAt: tenant.trialEndsAt,
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
        plan: true,
        status: true,
        chatId: true,
      },
    });

    if (!tenant || tenant.status !== 'ACTIVE') {
      return null;
    }

    return tenant;
  }
}
