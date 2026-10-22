import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId } from '@cf-erp/auth';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionDto, RoleQueryDto } from './dto/role.dto';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('roles.create')
  @ApiOperation({ summary: 'Create role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  async create(
    @CurrentTenantId() tenantId: string,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.create(tenantId, createRoleDto);
  }

  @Get()
  @Permissions('roles.read')
  @ApiOperation({ summary: 'List roles' })
  @ApiResponse({ status: 200, description: 'Roles list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: RoleQueryDto,
  ) {
    return this.rolesService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('roles.read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role details' })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.rolesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('roles.update')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(tenantId, id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions('roles.delete')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.rolesService.delete(tenantId, id);
    return { message: 'Role deleted successfully' };
  }

  @Post(':id/permissions')
  @Permissions('roles.assign_permission')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiResponse({ status: 200, description: 'Permission assigned' })
  async assignPermission(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() assignPermissionDto: AssignPermissionDto,
  ) {
    return this.rolesService.assignPermission(tenantId, id, assignPermissionDto);
  }

  @Delete(':id/permissions/:permissionId')
  @Permissions('roles.unassign_permission')
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiResponse({ status: 200, description: 'Permission removed' })
  async removePermission(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.rolesService.removePermission(tenantId, id, permissionId);
    return { message: 'Permission removed successfully' };
  }

  @Get(':id/permissions')
  @Permissions('roles.read')
  @ApiOperation({ summary: 'Get role permissions' })
  @ApiResponse({ status: 200, description: 'Role permissions' })
  async getPermissions(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.rolesService.getPermissions(tenantId, id);
  }

  @Get('permissions/all')
  @Permissions('roles.read')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'All permissions' })
  async getAllPermissions(@CurrentTenantId() tenantId: string) {
    return this.rolesService.getAllPermissions(tenantId);
  }
}