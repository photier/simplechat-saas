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
    // NOTE: This is legacy code. Use auth.service.ts for new tenant creation.
    const tenant = await this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        subdomain: createTenantDto.subdomain,
        apiKey,
        status: 'ACTIVE',
        config: {},
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
        chatbots: true,
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

  async getStats(tenantId: string) {
    // Get total users
    const totalUsers = await this.prisma.user.count({
      where: { tenantId },
    });

    // Get total messages
    const totalMessages = await this.prisma.message.count({
      where: { user: { tenantId } },
    });

    // Get total sessions
    const totalSessions = await this.prisma.session.count({
      where: { user: { tenantId } },
    });

    // Get widget opens
    const widgetOpens = await this.prisma.widgetOpen.count({
      where: { tenantId },
    });

    // Get AI vs human handled sessions
    const aiHandledSessions = await this.prisma.session.count({
      where: {
        user: { tenantId },
        humanMode: false,
      },
    });

    const humanHandledSessions = await this.prisma.session.count({
      where: {
        user: { tenantId },
        humanMode: true,
      },
    });

    // Get monthly message trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const messagesByMonth = await this.prisma.message.groupBy({
      by: ['createdAt'],
      where: {
        user: { tenantId },
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Group by month
    const monthlyData: { [key: string]: number } = {};
    messagesByMonth.forEach((item) => {
      const monthKey = new Date(item.createdAt).toISOString().substring(0, 7); // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + item._count.id;
    });

    const monthlyMessages = {
      labels: Object.keys(monthlyData).sort(),
      values: Object.keys(monthlyData)
        .sort()
        .map((key) => monthlyData[key]),
    };

    // Get country distribution
    const usersByCountry = await this.prisma.user.groupBy({
      by: ['country'],
      where: {
        tenantId,
        country: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const countryDistribution = usersByCountry.map((item) => ({
      country: item.country || 'Unknown',
      count: item._count.id,
    }));

    return {
      totalUsers,
      totalMessages,
      totalSessions,
      widgetOpens,
      aiHandledSessions,
      humanHandledSessions,
      monthlyMessages,
      countryDistribution,
      conversionRate:
        widgetOpens > 0 ? ((totalUsers / widgetOpens) * 100).toFixed(2) : '0.00',
    };
  }

  private generateApiKey(): string {
    return `sk_${randomBytes(32).toString('hex')}`;
  }
}
