import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, User, Role, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, UserQueryDto, UserResponseDto } from './dto/user.dto';
import { PaginatedResult } from '@cf-erp/shared';

@Injectable()
export class UsersService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email_tenantId: { email: createUserDto.email.toLowerCase(), tenantId } },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered in this tenant');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email.toLowerCase(),
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        passwordHash: hashedPassword,
        phone: createUserDto.phone,
        mobile: createUserDto.mobile,
        tenantId,
        branchId: createUserDto.branchId || branchId,
        isActive: createUserDto.isActive ?? true,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      await this.assignRoles(tenantId, user.id, createUserDto.roleIds);
    }

    return this.mapToResponse(user);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: UserQueryDto,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    if (query.roleId) {
      where.roles = {
        some: {
          roleId: query.roleId,
        },
      };
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponse(user);
  }

  async update(tenantId: string, id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findById(tenantId, id);

    const updateData: any = {
      ...updateUserDto,
      updatedAt: new Date(),
    };

    if (updateUserDto.roleIds) {
      await this.syncRoles(tenantId, id, updateUserDto.roleIds);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.mapToResponse(updatedUser);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async assignRole(tenantId: string, userId: string, assignRoleDto: AssignRoleDto): Promise<UserRole> {
    const user = await this.findById(tenantId, userId);

    const role = await this.prisma.role.findFirst({
      where: { id: assignRoleDto.roleId, tenantId, isDeleted: false },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existingUserRole = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId: assignRoleDto.roleId } },
    });

    if (existingUserRole) {
      throw new ConflictException('User already has this role');
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId: assignRoleDto.roleId,
        expiresAt: assignRoleDto.expiresAt ? new Date(assignRoleDto.expiresAt) : null,
      },
    });
  }

  async removeRole(tenantId: string, userId: string, roleId: string): Promise<void> {
    await this.findById(tenantId, userId);

    const userRole = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });

    if (!userRole) {
      throw new NotFoundException('User role not found');
    }

    await this.prisma.userRole.delete({
      where: { id: userRole.id },
    });
  }

  async updateStatus(tenantId: string, id: string, isActive: boolean): Promise<UserResponseDto> {
    const user = await this.findById(tenantId, id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive, updatedAt: new Date() },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.mapToResponse(updatedUser);
  }

  async updateBranch(tenantId: string, id: string, branchId: string | null): Promise<UserResponseDto> {
    const user = await this.findById(tenantId, id);

    if (branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: branchId, tenantId, isDeleted: false },
      });

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { branchId, updatedAt: new Date() },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.mapToResponse(updatedUser);
  }

  private async assignRoles(tenantId: string, userId: string, roleIds: string[]): Promise<void> {
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds }, tenantId, isDeleted: false },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    await this.prisma.userRole.createMany({
      data: roleIds.map(roleId => ({ userId, roleId })),
      skipDuplicates: true,
    });
  }

  private async syncRoles(tenantId: string, userId: string, roleIds: string[]): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: { userId },
    });

    if (roleIds.length > 0) {
      await this.assignRoles(tenantId, userId, roleIds);
    }
  }

  private mapToResponse(user: User & { roles: Array<{ role: Role }> }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      mobile: user.mobile,
      avatar: user.avatar,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
      branchId: user.branchId,
      roles: user.roles.map(ur => ({
        id: ur.role.id,
        code: ur.role.code,
        name: ur.role.name,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}