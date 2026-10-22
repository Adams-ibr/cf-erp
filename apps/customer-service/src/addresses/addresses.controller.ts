import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto, AddressQueryDto, AddressResponseDto } from './dto/address.dto';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @Permissions('addresses.create')
  @ApiOperation({ summary: 'Create address' })
  @ApiResponse({ status: 201, description: 'Address created', type: AddressResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(tenantId, userId, createAddressDto);
  }

  @Get()
  @Permissions('addresses.read')
  @ApiOperation({ summary: 'List addresses' })
  @ApiResponse({ status: 200, description: 'Addresses list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: AddressQueryDto,
  ) {
    return this.addressesService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('addresses.read')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: 200, description: 'Address details', type: AddressResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.addressesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('addresses.update')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated', type: AddressResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(tenantId, id, userId, updateAddressDto);
  }

  @Delete(':id')
  @Permissions('addresses.delete')
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.addressesService.delete(tenantId, id, userId);
    return { message: 'Address deleted successfully' };
  }

  @Put(':id/set-default')
  @Permissions('addresses.update')
  @ApiOperation({ summary: 'Set address as default for type' })
  @ApiResponse({ status: 200, description: 'Default address updated' })
  async setDefault(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.addressesService.setDefault(tenantId, id, userId);
  }
}