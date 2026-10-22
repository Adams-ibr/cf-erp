import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { FeesService } from './fees.service';
import { CreateFeeDto, FeeQueryDto, FeeResponseDto, PayFeeDto } from './dto/fee.dto';

@ApiTags('Customs Fees')
@Controller('customs-entries/:entryId/fees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Post()
  @Permissions('customs_fees.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add fee to customs entry' })
  @ApiResponse({ status: 201, description: 'Fee added', type: FeeResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Body() createFeeDto: CreateFeeDto,
  ) {
    return this.feesService.create(tenantId, entryId, userId, createFeeDto);
  }

  @Get()
  @Permissions('customs_fees.read')
  @ApiOperation({ summary: 'List fees for customs entry' })
  @ApiResponse({ status: 200, description: 'Fees list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Param('entryId') entryId: string,
    @Query() query: FeeQueryDto,
  ) {
    return this.feesService.findAll(tenantId, entryId, query);
  }

  @Get(':id')
  @Permissions('customs_fees.read')
  @ApiOperation({ summary: 'Get fee by ID' })
  @ApiResponse({ status: 200, description: 'Fee details', type: FeeResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
  ) {
    return this.feesService.findById(tenantId, entryId, id);
  }

  @Post(':id/pay')
  @Permissions('customs_fees.pay')
  @ApiOperation({ summary: 'Pay fee' })
  @ApiResponse({ status: 200, description: 'Fee paid' })
  async pay(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
    @Body() payFeeDto: PayFeeDto,
  ) {
    return this.feesService.pay(tenantId, entryId, id, userId, payFeeDto);
  }

  @Delete(':id')
  @Permissions('customs_fees.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete fee' })
  @ApiResponse({ status: 200, description: 'Fee deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Param('id') id: string,
  ) {
    await this.feesService.delete(tenantId, entryId, id, userId);
    return { message: 'Fee deleted successfully' };
  }
}