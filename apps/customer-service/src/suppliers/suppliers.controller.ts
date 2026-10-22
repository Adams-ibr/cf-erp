import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto, SupplierResponseDto } from './dto/supplier.dto';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Permissions('suppliers.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created', type: SupplierResponseDto })
  @ApiResponse({ status: 409, description: 'Supplier code already exists' })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createSupplierDto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(tenantId, branchId, userId, createSupplierDto);
  }

  @Get()
  @Permissions('suppliers.read')
  @ApiOperation({ summary: 'List suppliers' })
  @ApiResponse({ status: 200, description: 'Suppliers list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: SupplierQueryDto,
  ) {
    return this.suppliersService.findAll(tenantId, branchId, query);
  }

  @Get('stats')
  @Permissions('suppliers.read')
  @ApiOperation({ summary: 'Get supplier statistics' })
  @ApiResponse({ status: 200, description: 'Supplier statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.suppliersService.getStats(tenantId, branchId);
  }

  @Get(':id')
  @Permissions('suppliers.read')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier details', type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.suppliersService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('suppliers.update')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated', type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(tenantId, id, userId, updateSupplierDto);
  }

  @Delete(':id')
  @Permissions('suppliers.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.suppliersService.delete(tenantId, id, userId);
    return { message: 'Supplier deleted successfully' };
  }

  @Put(':id/status')
  @Permissions('suppliers.update_status')
  @ApiOperation({ summary: 'Update supplier status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.suppliersService.updateStatus(tenantId, id, userId, body.status);
  }

  @Put(':id/assign')
  @Permissions('suppliers.assign')
  @ApiOperation({ summary: 'Assign supplier to user' })
  @ApiResponse({ status: 200, description: 'Supplier assigned' })
  async assign(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { assignedToId: string },
  ) {
    return this.suppliersService.assign(tenantId, id, userId, body.assignedToId);
  }

  @Get(':id/activities')
  @Permissions('suppliers.read')
  @ApiOperation({ summary: 'Get supplier activities' })
  @ApiResponse({ status: 200, description: 'Supplier activities' })
  async getActivities(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.suppliersService.getActivities(tenantId, id, query.page, query.limit);
  }

  @Post(':id/activities')
  @Permissions('suppliers.create_activity')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add supplier activity' })
  @ApiResponse({ status: 201, description: 'Activity added' })
  async addActivity(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { type: string; subject: string; description?: string; metadata?: Record<string, unknown> },
  ) {
    return this.suppliersService.addActivity(tenantId, id, userId, body);
  }
}