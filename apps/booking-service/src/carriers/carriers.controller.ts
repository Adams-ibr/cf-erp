import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { CarriersService } from './carriers.service';
import { CreateCarrierDto, UpdateCarrierDto, CarrierQueryDto, CarrierResponseDto, CreateCarrierServiceDto } from './dto/carrier.dto';

@ApiTags('Carriers')
@Controller('carriers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Post()
  @Permissions('carriers.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create carrier' })
  @ApiResponse({ status: 201, description: 'Carrier created', type: CarrierResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createCarrierDto: CreateCarrierDto,
  ) {
    return this.carriersService.create(tenantId, branchId, userId, createCarrierDto);
  }

  @Get()
  @Permissions('carriers.read')
  @ApiOperation({ summary: 'List carriers' })
  @ApiResponse({ status: 200, description: 'Carriers list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: CarrierQueryDto,
  ) {
    return this.carriersService.findAll(tenantId, branchId, query);
  }

  @Get('preferred')
  @Permissions('carriers.read')
  @ApiOperation({ summary: 'Get preferred carriers' })
  @ApiResponse({ status: 200, description: 'Preferred carriers' })
  async getPreferred(
    @CurrentTenantId() tenantId: string,
    @Query() query: { mode?: string; origin?: string; destination?: string },
  ) {
    return this.carriersService.getPreferredCarriers(tenantId, query);
  }

  @Get('stats')
  @Permissions('carriers.read')
  @ApiOperation({ summary: 'Get carrier statistics' })
  @ApiResponse({ status: 200, description: 'Carrier statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.carriersService.getStats(tenantId, branchId);
  }

  @Get(':id')
  @Permissions('carriers.read')
  @ApiOperation({ summary: 'Get carrier by ID' })
  @ApiResponse({ status: 200, description: 'Carrier details', type: CarrierResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('carriers.update')
  @ApiOperation({ summary: 'Update carrier' })
  @ApiResponse({ status: 200, description: 'Carrier updated', type: CarrierResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateCarrierDto: UpdateCarrierDto,
  ) {
    return this.carriersService.update(tenantId, id, userId, updateCarrierDto);
  }

  @Delete(':id')
  @Permissions('carriers.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete carrier' })
  @ApiResponse({ status: 200, description: 'Carrier deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.carriersService.delete(tenantId, id, userId);
    return { message: 'Carrier deleted successfully' };
  }

  @Post(':id/services')
  @Permissions('carriers.update')
  @ApiOperation({ summary: 'Add service to carrier' })
  @ApiResponse({ status: 201, description: 'Service added' })
  async addService(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() createCarrierServiceDto: CreateCarrierServiceDto,
  ) {
    return this.carriersService.addService(tenantId, id, userId, createCarrierServiceDto);
  }

  @Delete(':id/services/:serviceId')
  @Permissions('carriers.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove service from carrier' })
  @ApiResponse({ status: 200, description: 'Service removed' })
  async removeService(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
  ) {
    await this.carriersService.removeService(tenantId, id, serviceId, userId);
    return { message: 'Service removed successfully' };
  }

  @Put(':id/preferred')
  @Permissions('carriers.update')
  @ApiOperation({ summary: 'Set carrier as preferred' })
  @ApiResponse({ status: 200, description: 'Preferred status updated' })
  async setPreferred(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { isPreferred: boolean },
  ) {
    return this.carriersService.setPreferred(tenantId, id, userId, body.isPreferred);
  }

  @Put(':id/activate')
  @Permissions('carriers.update')
  @ApiOperation({ summary: 'Activate carrier' })
  @ApiResponse({ status: 200, description: 'Carrier activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('carriers.update')
  @ApiOperation({ summary: 'Deactivate carrier' })
  @ApiResponse({ status: 200, description: 'Carrier deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.setActive(tenantId, id, userId, false);
  }
}