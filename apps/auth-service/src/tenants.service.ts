import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, Tenant } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateTenantDto, UpdateTenantDto, TenantQueryDto, TenantResponseDto } from './dto/tenant.dto';
import { PaginatedResult } from '@cf-erp/shared';

@Injectable()
export class TenantsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(userId: string, createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { code: createTenantDto.code },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant code already exists');
    }

    if (createTenantDto.domain) {
      const existingDomain = await this.prisma.tenant.findUnique({
        where: { domain: createTenantDto.domain },
      });

      if (existingDomain) {
        throw new ConflictException('Domain already in use');
      }
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        code: createTenantDto.code,
        logo: createTenantDto.logo,
        domain: createTenantDto.domain,
        timezone: createTenantDto.timezone || 'UTC',
        locale: createTenantDto.locale || 'en',
        dateFormat: createTenantDto.dateFormat || 'YYYY-MM-DD',
        currency: createTenantDto.currency || 'USD',
        settings: createTenantDto.settings,
        address: createTenantDto.address,
        contact: createTenantDto.contact,
      },
    });

    // Create default branch
    await this.prisma.branch.create({
      data: {
        name: 'Head Office',
        code: 'HO',
        tenantId: tenant.id,
        isActive: true,
      },
    });

    // Create system roles and permissions
    await this.createSystemRolesAndPermissions(tenant.id);

    return this.mapToResponse(tenant);
  }

  async findAll(query: TenantQueryDto): Promise<PaginatedResult<TenantResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { domain: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<TenantResponseDto> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, isDeleted: false },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.mapToResponse(tenant);
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    const tenant = await this.findById(id);

    if (updateTenantDto.domain && updateTenantDto.domain !== tenant.domain) {
      const existingDomain = await this.prisma.tenant.findUnique({
        where: { domain: updateTenantDto.domain },
      });

      if (existingDomain) {
        throw new ConflictException('Domain already in use');
      }
    }

    const updatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...updateTenantDto,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedTenant);
  }

  async delete(id: string): Promise<void> {
    const tenant = await this.findById(id);

    await this.prisma.tenant.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, isActive: boolean): Promise<TenantResponseDto> {
    const tenant = await this.findById(id);

    const updatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: { isActive, updatedAt: new Date() },
    });

    return this.mapToResponse(updatedTenant);
  }

  private async createSystemRolesAndPermissions(tenantId: string): Promise<void> {
    // Create system permissions
    const systemPermissions = [
      { code: 'users.create', name: 'Create Users', resource: 'USER', action: 'CREATE' },
      { code: 'users.read', name: 'Read Users', resource: 'USER', action: 'READ' },
      { code: 'users.update', name: 'Update Users', resource: 'USER', action: 'UPDATE' },
      { code: 'users.delete', name: 'Delete Users', resource: 'USER', action: 'DELETE' },
      { code: 'users.assign_role', name: 'Assign User Roles', resource: 'USER', action: 'ASSIGN' },
      { code: 'users.unassign_role', name: 'Unassign User Roles', resource: 'USER', action: 'UNASSIGN' },
      { code: 'users.update_status', name: 'Update User Status', resource: 'USER', action: 'UPDATE' },
      { code: 'users.update_branch', name: 'Update User Branch', resource: 'USER', action: 'UPDATE' },
      { code: 'roles.create', name: 'Create Roles', resource: 'ROLE', action: 'CREATE' },
      { code: 'roles.read', name: 'Read Roles', resource: 'ROLE', action: 'READ' },
      { code: 'roles.update', name: 'Update Roles', resource: 'ROLE', action: 'UPDATE' },
      { code: 'roles.delete', name: 'Delete Roles', resource: 'ROLE', action: 'DELETE' },
      { code: 'roles.assign_permission', name: 'Assign Role Permissions', resource: 'ROLE', action: 'ASSIGN' },
      { code: 'roles.unassign_permission', name: 'Unassign Role Permissions', resource: 'ROLE', action: 'UNASSIGN' },
      { code: 'tenants.update', name: 'Update Tenant', resource: 'TENANT', action: 'UPDATE' },
      { code: 'tenants.update_status', name: 'Update Tenant Status', resource: 'TENANT', action: 'UPDATE' },
    ];

    for (const perm of systemPermissions) {
      await this.prisma.permission.upsert({
        where: { code: perm.code },
        create: { ...perm, isSystem: true, tenantId: null },
        update: { name: perm.name, resource: perm.resource, action: perm.action },
      });
    }

    // Create default roles
    const adminRole = await this.prisma.role.create({
      data: {
        code: 'ADMIN',
        name: 'Administrator',
        description: 'Full administrative access',
        isSystem: true,
        tenantId,
      },
    });

    const userRole = await this.prisma.role.create({
      data: {
        code: 'USER',
        name: 'Standard User',
        description: 'Standard user access',
        isSystem: true,
        tenantId,
      },
    });

    // Assign all permissions to admin role
    const allPermissions = await this.prisma.permission.findMany({
      where: { isSystem: true },
    });

    await this.prisma.rolePermission.createMany({
      data: allPermissions.map(p => ({
        roleId: adminRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    // Assign basic permissions to user role
    const basicPermissions = await this.prisma.permission.findMany({
      where: {
        code: { in: ['users.read', 'roles.read'] },
        isSystem: true,
      },
    });

    await this.prisma.rolePermission.createMany({
      data: basicPermissions.map(p => ({
        roleId: userRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });
  }

  private mapToResponse(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id,
      name: tenant.name,
      code: tenant.code,
      logo: tenant.logo,
      domain: tenant.domain,
      timezone: tenant.timezone,
      locale: tenant.locale,
      dateFormat: tenant.dateFormat,
      currency: tenant.currency,
      settings: tenant.settings as Record<string, unknown> | undefined,
      address: tenant.address as Record<string, unknown> | undefined,
      contact: tenant.contact as Record<string, unknown> | undefined,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}