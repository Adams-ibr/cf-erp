import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { CustomsBrokersService } from './customs-brokers.service';
import { CreateCustomsBrokerDto, UpdateCustomsBrokerDto, CustomsBrokerQueryDto, CustomsBrokerResponseDto } from './dto/customs-broker.dto';

@ApiTags('Customs Brokers')
@Controller('customs-brokers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomsBrokersController {
  constructor(private readonly customsBrokersService: CustomsBrokersService) {}

  @Post()
  @Permissions('customs_brokers.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create customs broker' })
  @ApiResponse({ status: 201, description: 'Customs broker created', type: CustomsBrokerResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createCustomsBrokerDto: CreateCustomsBrokerDto,
  ) {
    return this.customsBrokersService.create(tenantId, userId, createCustomsBrokerDto);
  }

  @Get()
  @Permissions('customs_brokers.read')
  @ApiOperation({ summary: 'List customs brokers' })
  @ApiResponse({ status: 200, description: 'Customs brokers list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: CustomsBrokerQueryDto,
  ) {
    return this.customsBrokersService.findAll(tenantId, query);
  }

  @Get('preferred')
  @Permissions('customs_brokers.read')
  @ApiOperation({ summary: 'Get preferred customs brokers' })
  @ApiResponse({ status: 200, description: 'Preferred customs brokers' })
  async getPreferred(@CurrentTenantId() tenantId: string) {
    return this.customsBrokersService.getPreferred(tenantId);
  }

  @Get(':id')
  @Permissions('customs_brokers.read')
  @ApiOperation({ summary: 'Get customs broker by ID' })
  @ApiResponse({ status: 200, description: 'Customs broker details', type: CustomsBrokerResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.customsBrokersService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('customs_brokers.update')
  @ApiOperation({ summary: 'Update customs broker' })
  @ApiResponse({ status: 200, description: 'Customs broker updated', type: CustomsBrokerResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateCustomsBrokerDto: UpdateCustomsBrokerDto,
  ) {
    return this.customsBrokersService.update(tenantId, id, userId, updateCustomsBrokerDto);
  }

  @Delete(':id')
  @Permissions('customs_brokers.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete customs broker' })
  @ApiResponse({ status: 200, description: 'Customs broker deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.customsBrokersService.delete(tenantId, id, userId);
    return { message: 'Customs broker deleted successfully' };
  }

  @Put(':id/activate')
  @Permissions('customs_brokers.update')
  @ApiOperation({ summary: 'Activate customs broker' })
  @ApiResponse({ status: 200, description: 'Customs broker activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.customsBrokersService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('customs_brokers.update')
  @ApiOperation({ summary: 'Deactivate customs broker' })
  @ApiResponse({ status: 200, description: 'Customs broker deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.customsBrokersService.setActive(tenantId, id, userId, false);
  }

  @Put(':id/preferred')
  @Permissions('customs_brokers.update')
  @ApiOperation({ summary: 'Set preferred status' })
  @ApiResponse({ status: 200, description: 'Preferred status updated' })
  async setPreferred(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { isPreferred: boolean },
  ) {
    return this.customsBrokersService.setPreferred(tenantId, id, userId, body.isPreferred);
  }
}