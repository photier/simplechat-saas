import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if subdomain already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Subdomain already exists');
    }

    // Generate API key
    const apiKey = this.generateApiKey();

    // Create tenant with default config
    const tenant = await this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        subdomain: createTenantDto.subdomain,
        apiKey,
        widgetType: createTenantDto.widgetType,
        plan: createTenantDto.plan || 'FREE',
        config: createTenantDto.config || {
          titleOpen: createTenantDto.widgetType === 'PREMIUM' ? '🤖 AI Bot (Premium)' : '🤖 AI Bot',
          introMessage: 'Hello, How can I help you today? ✨',
          mainColor: createTenantDto.widgetType === 'PREMIUM' ? '#9F7AEA' : '#4c86f0',
          desktopHeight: 600,
          desktopWidth: 380,
        },
      },
    });

    return tenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        widgets: true,
        users: {
          take: 10,
          orderBy: { lastSeenAt: 'desc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain ${subdomain} not found`);
    }

    return tenant;
  }

  async findByApiKey(apiKey: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { apiKey },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with API key not found`);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    // Check if tenant exists
    await this.findOne(id);

    // If subdomain is being updated, check uniqueness
    if (updateTenantDto.subdomain) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { subdomain: updateTenantDto.subdomain },
      });

      if (existingTenant && existingTenant.id !== id) {
        throw new ConflictException('Subdomain already exists');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async delete(id: string): Promise<Tenant> {
    // Check if tenant exists
    await this.findOne(id);

    // Soft delete by setting status to DELETED
    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async hardDelete(id: string): Promise<Tenant> {
    // Check if tenant exists
    await this.findOne(id);

    // Hard delete (will cascade delete all related data)
    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async regenerateApiKey(id: string): Promise<Tenant> {
    // Check if tenant exists
    await this.findOne(id);

    const newApiKey = this.generateApiKey();

    return this.prisma.tenant.update({
      where: { id },
      data: { apiKey: newApiKey },
    });
  }

  private generateApiKey(): string {
    return `sk_${randomBytes(32).toString('hex')}`;
  }
}
