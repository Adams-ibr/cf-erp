import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, Roles, CurrentTenantId, CurrentBranchId } from '@cf-erp/auth';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, UserQueryDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('users.create')
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(tenantId, branchId, createUserDto);
  }

  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: 200, description: 'Users list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: UserQueryDto,
  ) {
    return this.usersService.findAll(tenantId, branchId, query);
  }

  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(tenantId, id, updateUserDto);
  }

  @Delete(':id')
  @Permissions('users.delete')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.usersService.delete(tenantId, id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/roles')
  @Permissions('users.assign_role')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned' })
  async assignRole(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.usersService.assignRole(tenantId, id, assignRoleDto);
  }

  @Delete(':id/roles/:roleId')
  @Permissions('users.unassign_role')
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed' })
  async removeRole(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ) {
    await this.usersService.removeRole(tenantId, id, roleId);
    return { message: 'Role removed successfully' };
  }

  @Put(':id/status')
  @Permissions('users.update_status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.usersService.updateStatus(tenantId, id, body.isActive);
  }

  @Put(':id/branch')
  @Permissions('users.update_branch')
  @ApiOperation({ summary: 'Update user branch' })
  @ApiResponse({ status: 200, description: 'Branch updated' })
  async updateBranch(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { branchId: string | null },
  ) {
    return this.usersService.updateBranch(tenantId, id, body.branchId);
  }
}