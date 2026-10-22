import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentUserId } from '@cf-erp/auth';
import { TariffCodesService } from './tariff-codes.service';
import { CreateTariffCodeDto, UpdateTariffCodeDto, TariffCodeQueryDto, TariffCodeResponseDto } from './dto/tariff-code.dto';

@ApiTags('Tariff Codes')
@Controller('tariff-codes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TariffCodesController {
  constructor(private readonly tariffCodesService: TariffCodesService) {}

  @Post()
  @Permissions('tariff_codes.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tariff code' })
  @ApiResponse({ status: 201, description: 'Tariff code created', type: TariffCodeResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Body() createTariffCodeDto: CreateTariffCodeDto,
  ) {
    return this.tariffCodesService.create(tenantId, userId, createTariffCodeDto);
  }

  @Get()
  @Permissions('tariff_codes.read')
  @ApiOperation({ summary: 'List tariff codes' })
  @ApiResponse({ status: 200, description: 'Tariff codes list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() query: TariffCodeQueryDto,
  ) {
    return this.tariffCodesService.findAll(tenantId, query);
  }

  @Get('search')
  @Permissions('tariff_codes.read')
  @ApiOperation({ summary: 'Search tariff codes by keyword' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @CurrentTenantId() tenantId: string,
    @Query('q') keyword: string,
    @Query('limit') limit?: number,
  ) {
    return this.tariffCodesService.search(tenantId, keyword, limit || 10);
  }

  @Get(':id')
  @Permissions('tariff_codes.read')
  @ApiOperation({ summary: 'Get tariff code by ID' })
  @ApiResponse({ status: 200, description: 'Tariff code details', type: TariffCodeResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.tariffCodesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('tariff_codes.update')
  @ApiOperation({ summary: 'Update tariff code' })
  @ApiResponse({ status: 200, description: 'Tariff code updated', type: TariffCodeResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateTariffCodeDto: UpdateTariffCodeDto,
  ) {
    return this.tariffCodesService.update(tenantId, id, userId, updateTariffCodeDto);
  }

  @Delete(':id')
  @Permissions('tariff_codes.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete tariff code' })
  @ApiResponse({ status: 200, description: 'Tariff code deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.tariffCodesService.delete(tenantId, id, userId);
    return { message: 'Tariff code deleted successfully' };
  }

  @Put(':id/activate')
  @Permissions('tariff_codes.update')
  @ApiOperation({ summary: 'Activate tariff code' })
  @ApiResponse({ status: 200, description: 'Tariff code activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.tariffCodesService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('tariff_codes.update')
  @ApiOperation({ summary: 'Deactivate tariff code' })
  @ApiResponse({ status: 200, description: 'Tariff code deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.tariffCodesService.setActive(tenantId, id, userId, false);
  }
}