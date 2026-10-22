import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { RatesService } from './rates.service';
import { CreateRateDto, UpdateRateDto, RateQueryDto, RateResponseDto } from './dto/rate.dto';

@ApiTags('Rates')
@Controller('rates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Post()
  @Permissions('rates.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create rate' })
  @ApiResponse({ status: 201, description: 'Rate created', type: RateResponseDto })
  @ApiResponse({ status: 409, description: 'Rate code already exists' })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createRateDto: CreateRateDto,
  ) {
    return this.ratesService.create(tenantId, branchId, userId, createRateDto);
  }

  @Get()
  @Permissions('rates.read')
  @ApiOperation({ summary: 'List rates' })
  @ApiResponse({ status: 200, description: 'Rates list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: RateQueryDto,
  ) {
    return this.ratesService.findAll(tenantId, branchId, query);
  }

  @Get(':id')
  @Permissions('rates.read')
  @ApiOperation({ summary: 'Get rate by ID' })
  @ApiResponse({ status: 200, description: 'Rate details', type: RateResponseDto })
  @ApiResponse({ status: 404, description: 'Rate not found' })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ratesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('rates.update')
  @ApiOperation({ summary: 'Update rate' })
  @ApiResponse({ status: 200, description: 'Rate updated', type: RateResponseDto })
  @ApiResponse({ status: 404, description: 'Rate not found' })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateRateDto: UpdateRateDto,
  ) {
    return this.ratesService.update(tenantId, id, userId, updateRateDto);
  }

  @Delete(':id')
  @Permissions('rates.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete rate' })
  @ApiResponse({ status: 200, description: 'Rate deleted' })
  @ApiResponse({ status: 404, description: 'Rate not found' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.ratesService.delete(tenantId, id, userId);
    return { message: 'Rate deleted successfully' };
  }

  @Put(':id/activate')
  @Permissions('rates.update')
  @ApiOperation({ summary: 'Activate rate' })
  @ApiResponse({ status: 200, description: 'Rate activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.ratesService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('rates.update')
  @ApiOperation({ summary: 'Deactivate rate' })
  @ApiResponse({ status: 200, description: 'Rate deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.ratesService.setActive(tenantId, id, userId, false);
  }
}