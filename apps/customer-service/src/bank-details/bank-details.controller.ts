import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { BankDetailsService } from './bank-details.service';
import { CreateBankDetailDto, UpdateBankDetailDto, BankDetailQueryDto, BankDetailResponseDto } from './dto/bank-detail.dto';

@ApiTags('Bank Details')
@Controller('bank-details')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BankDetailsController {
  constructor(private readonly bankDetailsService: BankDetailsService) {}

  @Post()
  @Permissions('bank_details.create')
  @ApiOperation({ summary: 'Create bank detail' })
  @ApiResponse({ status: 201, description: 'Bank detail created', type: BankDetailResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createBankDetailDto: CreateBankDetailDto,
  ) {
    return this.bankDetailsService.create(tenantId, userId, createBankDetailDto);
  }

  @Get()
  @Permissions('bank_details.read')
  @ApiOperation({ summary: 'List bank details' })
  @ApiResponse({ status: 200, description: 'Bank details list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: BankDetailQueryDto,
  ) {
    return this.bankDetailsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('bank_details.read')
  @ApiOperation({ summary: 'Get bank detail by ID' })
  @ApiResponse({ status: 200, description: 'Bank detail details', type: BankDetailResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.bankDetailsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('bank_details.update')
  @ApiOperation({ summary: 'Update bank detail' })
  @ApiResponse({ status: 200, description: 'Bank detail updated', type: BankDetailResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateBankDetailDto: UpdateBankDetailDto,
  ) {
    return this.bankDetailsService.update(tenantId, id, userId, updateBankDetailDto);
  }

  @Delete(':id')
  @Permissions('bank_details.delete')
  @ApiOperation({ summary: 'Delete bank detail' })
  @ApiResponse({ status: 200, description: 'Bank detail deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.bankDetailsService.delete(tenantId, id, userId);
    return { message: 'Bank detail deleted successfully' };
  }

  @Put(':id/set-default')
  @Permissions('bank_details.update')
  @ApiOperation({ summary: 'Set bank detail as default' })
  @ApiResponse({ status: 200, description: 'Default bank detail updated' })
  async setDefault(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.bankDetailsService.setDefault(tenantId, id, userId);
  }
}