import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { TradeAgreementsService } from './trade-agreements.service';
import { CreateTradeAgreementDto, UpdateTradeAgreementDto, TradeAgreementQueryDto, TradeAgreementResponseDto } from './dto/trade-agreement.dto';

@ApiTags('Trade Agreements')
@Controller('trade-agreements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TradeAgreementsController {
  constructor(private readonly tradeAgreementsService: TradeAgreementsService) {}

  @Post()
  @Permissions('trade_agreements.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create trade agreement' })
  @ApiResponse({ status: 201, description: 'Trade agreement created', type: TradeAgreementResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createTradeAgreementDto: CreateTradeAgreementDto,
  ) {
    return this.tradeAgreementsService.create(tenantId, userId, createTradeAgreementDto);
  }

  @Get()
  @Permissions('trade_agreements.read')
  @ApiOperation({ summary: 'List trade agreements' })
  @ApiResponse({ status: 200, description: 'Trade agreements list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: TradeAgreementQueryDto,
  ) {
    return this.tradeAgreementsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('trade_agreements.read')
  @ApiOperation({ summary: 'Get trade agreement by ID' })
  @ApiResponse({ status: 200, description: 'Trade agreement details', type: TradeAgreementResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.tradeAgreementsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('trade_agreements.update')
  @ApiOperation({ summary: 'Update trade agreement' })
  @ApiResponse({ status: 200, description: 'Trade agreement updated', type: TradeAgreementResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateTradeAgreementDto: UpdateTradeAgreementDto,
  ) {
    return this.tradeAgreementsService.update(tenantId, id, userId, updateTradeAgreementDto);
  }

  @Delete(':id')
  @Permissions('trade_agreements.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete trade agreement' })
  @ApiResponse({ status: 200, description: 'Trade agreement deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.tradeAgreementsService.delete(tenantId, id, userId);
    return { message: 'Trade agreement deleted successfully' };
  }

  @Post(':id/tariffs')
  @Permissions('trade_agreements.update')
  @ApiOperation({ summary: 'Add tariff to trade agreement' })
  @ApiResponse({ status: 201, description: 'Tariff added' })
  async addTariff(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { tariffCodeId: string; preferentialRate: number; rulesOfOrigin?: Record<string, unknown>; notes?: string },
  ) {
    return this.tradeAgreementsService.addTariff(tenantId, id, userId, body);
  }

  @Delete(':id/tariffs/:tariffId')
  @Permissions('trade_agreements.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove tariff from trade agreement' })
  @ApiResponse({ status: 200, description: 'Tariff removed' })
  async removeTariff(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('tariffId') tariffId: string,
  ) {
    await this.tradeAgreementsService.removeTariff(tenantId, id, tariffId, userId);
    return { message: 'Tariff removed successfully' };
  }

  @Put(':id/activate')
  @Permissions('trade_agreements.update')
  @ApiOperation({ summary: 'Activate trade agreement' })
  @ApiResponse({ status: 200, description: 'Trade agreement activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.tradeAgreementsService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('trade_agreements.update')
  @ApiOperation({ summary: 'Deactivate trade agreement' })
  @ApiResponse({ status: 200, description: 'Trade agreement deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.tradeAgreementsService.setActive(tenantId, id, userId, false);
  }
}