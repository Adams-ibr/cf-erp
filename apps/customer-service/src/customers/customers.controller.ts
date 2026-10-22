import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, CustomerResponseDto } from './dto/customer.dto';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions('customers.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: 201, description: 'Customer created', type: CustomerResponseDto })
  @ApiResponse({ status: 409, description: 'Customer code already exists' })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create(tenantId, branchId, userId, createCustomerDto);
  }

  @Get()
  @Permissions('customers.read')
  @ApiOperation({ summary: 'List customers' })
  @ApiResponse({ status: 200, description: 'Customers list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: CustomerQueryDto,
  ) {
    return this.customersService.findAll(tenantId, branchId, query);
  }

  @Get('stats')
  @Permissions('customers.read')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Customer statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.customersService.getStats(tenantId, branchId);
  }

  @Get(':id')
  @Permissions('customers.read')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer details', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('customers.update')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(tenantId, id, userId, updateCustomerDto);
  }

  @Delete(':id')
  @Permissions('customers.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.customersService.delete(tenantId, id, userId);
    return { message: 'Customer deleted successfully' };
  }

  @Put(':id/status')
  @Permissions('customers.update_status')
  @ApiOperation({ summary: 'Update customer status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.customersService.updateStatus(tenantId, id, userId, body.status);
  }

  @Put(':id/assign')
  @Permissions('customers.assign')
  @ApiOperation({ summary: 'Assign customer to user' })
  @ApiResponse({ status: 200, description: 'Customer assigned' })
  async assign(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { assignedToId: string },
  ) {
    return this.customersService.assign(tenantId, id, userId, body.assignedToId);
  }

  @Get(':id/activities')
  @Permissions('customers.read')
  @ApiOperation({ summary: 'Get customer activities' })
  @ApiResponse({ status: 200, description: 'Customer activities' })
  async getActivities(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.customersService.getActivities(tenantId, id, query.page, query.limit);
  }

  @Post(':id/activities')
  @Permissions('customers.create_activity')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add customer activity' })
  @ApiResponse({ status: 201, description: 'Activity added' })
  async addActivity(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { type: string; subject: string; description?: string; metadata?: Record<string, unknown> },
  ) {
    return this.customersService.addActivity(tenantId, id, userId, body);
  }
}