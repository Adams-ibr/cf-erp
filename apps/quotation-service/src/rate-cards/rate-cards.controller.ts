import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { RateCardsService } from './rate-cards.service';
import { CreateRateCardDto, UpdateRateCardDto, RateCardQueryDto, RateCardResponseDto, AddRateCardItemDto } from './dto/rate-card.dto';

@ApiTags('Rate Cards')
@Controller('rate-cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RateCardsController {
  constructor(private readonly rateCardsService: RateCardsService) {}

  @Post()
  @Permissions('rate_cards.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create rate card' })
  @ApiResponse({ status: 201, description: 'Rate card created', type: RateCardResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createRateCardDto: CreateRateCardDto,
  ) {
    return this.rateCardsService.create(tenantId, branchId, userId, createRateCardDto);
  }

  @Get()
  @Permissions('rate_cards.read')
  @ApiOperation({ summary: 'List rate cards' })
  @ApiResponse({ status: 200, description: 'Rate cards list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: RateCardQueryDto,
  ) {
    return this.rateCardsService.findAll(tenantId, branchId, query);
  }

  @Get(':id')
  @Permissions('rate_cards.read')
  @ApiOperation({ summary: 'Get rate card by ID' })
  @ApiResponse({ status: 200, description: 'Rate card details', type: RateCardResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.rateCardsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('rate_cards.update')
  @ApiOperation({ summary: 'Update rate card' })
  @ApiResponse({ status: 200, description: 'Rate card updated', type: RateCardResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateRateCardDto: UpdateRateCardDto,
  ) {
    return this.rateCardsService.update(tenantId, id, userId, updateRateCardDto);
  }

  @Delete(':id')
  @Permissions('rate_cards.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete rate card' })
  @ApiResponse({ status: 200, description: 'Rate card deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.rateCardsService.delete(tenantId, id, userId);
    return { message: 'Rate card deleted successfully' };
  }

  @Post(':id/items')
  @Permissions('rate_cards.update')
  @ApiOperation({ summary: 'Add item to rate card' })
  @ApiResponse({ status: 201, description: 'Item added' })
  async addItem(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() addRateCardItemDto: AddRateCardItemDto,
  ) {
    return this.rateCardsService.addItem(tenantId, id, userId, addRateCardItemDto);
  }

  @Delete(':id/items/:itemId')
  @Permissions('rate_cards.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from rate card' })
  @ApiResponse({ status: 200, description: 'Item removed' })
  async removeItem(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    await this.rateCardsService.removeItem(tenantId, id, itemId, userId);
    return { message: 'Item removed successfully' };
  }

  @Put(':id/approve')
  @Permissions('rate_cards.approve')
  @ApiOperation({ summary: 'Approve rate card' })
  @ApiResponse({ status: 200, description: 'Rate card approved' })
  async approve(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.rateCardsService.approve(tenantId, id, userId);
  }

  @Put(':id/activate')
  @Permissions('rate_cards.update')
  @ApiOperation({ summary: 'Activate rate card' })
  @ApiResponse({ status: 200, description: 'Rate card activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.rateCardsService.setStatus(tenantId, id, userId, 'ACTIVE');
  }

  @Put(':id/expire')
  @Permissions('rate_cards.update')
  @ApiOperation({ summary: 'Expire rate card' })
  @ApiResponse({ status: 200, description: 'Rate card expired' })
  async expire(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.rateCardsService.setStatus(tenantId, id, userId, 'EXPIRED');
  }
}