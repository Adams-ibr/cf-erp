import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, Roles, CurrentUserId, CurrentTenantId } from '@cf-erp/auth';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto, TenantQueryDto } from './dto/tenant.dto';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create tenant (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Tenant created' })
  async create(
    @CurrentUserId() userId: string,
    @Body() createTenantDto: CreateTenantDto,
  ) {
    return this.tenantsService.create(userId, createTenantDto);
  }

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all tenants (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Tenants list' })
  async findAll(@Query() query: TenantQueryDto) {
    return this.tenantsService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current tenant' })
  @ApiResponse({ status: 200, description: 'Current tenant details' })
  async getCurrent(@CurrentTenantId() tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get tenant by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Tenant details' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Put(':id')
  @Permissions('tenants.update')
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated' })
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    if (tenantId !== id) {
      throw new Error('Cannot update other tenant');
    }
    return this.tenantsService.update(tenantId, updateTenantDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete tenant (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Tenant deleted' })
  async delete(@Param('id') id: string) {
    await this.tenantsService.delete(id);
    return { message: 'Tenant deleted successfully' };
  }

  @Put(':id/status')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update tenant status (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.tenantsService.updateStatus(id, body.isActive);
  }
}