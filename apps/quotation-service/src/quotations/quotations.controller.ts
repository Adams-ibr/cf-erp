import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto, UpdateQuotationDto, QuotationQueryDto, QuotationResponseDto, SendQuotationDto, RespondQuotationDto } from './dto/quotation.dto';

@ApiTags('Quotations')
@Controller('quotations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @Permissions('quotations.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create quotation' })
  @ApiResponse({ status: 201, description: 'Quotation created', type: QuotationResponseDto })
  @ApiResponse({ status: 409, description: 'Quotation code already exists' })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createQuotationDto: CreateQuotationDto,
  ) {
    return this.quotationsService.create(tenantId, branchId, userId, createQuotationDto);
  }

  @Get()
  @Permissions('quotations.read')
  @ApiOperation({ summary: 'List quotations' })
  @ApiResponse({ status: 200, description: 'Quotations list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: QuotationQueryDto,
  ) {
    return this.quotationsService.findAll(tenantId, branchId, query);
  }

  @Get('stats')
  @Permissions('quotations.read')
  @ApiOperation({ summary: 'Get quotation statistics' })
  @ApiResponse({ status: 200, description: 'Quotation statistics' })
  async getStats(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
  ) {
    return this.quotationsService.getStats(tenantId, branchId);
  }

  @Get(':id')
  @Permissions('quotations.read')
  @ApiOperation({ summary: 'Get quotation by ID' })
  @ApiResponse({ status: 200, description: 'Quotation details', type: QuotationResponseDto })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.quotationsService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('quotations.update')
  @ApiOperation({ summary: 'Update quotation' })
  @ApiResponse({ status: 200, description: 'Quotation updated', type: QuotationResponseDto })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
  ) {
    return this.quotationsService.update(tenantId, id, userId, updateQuotationDto);
  }

  @Delete(':id')
  @Permissions('quotations.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete quotation' })
  @ApiResponse({ status: 200, description: 'Quotation deleted' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.quotationsService.delete(tenantId, id, userId);
    return { message: 'Quotation deleted successfully' };
  }

  @Post(':id/send')
  @Permissions('quotations.send')
  @ApiOperation({ summary: 'Send quotation to customer' })
  @ApiResponse({ status: 200, description: 'Quotation sent' })
  async send(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() sendQuotationDto: SendQuotationDto,
  ) {
    return this.quotationsService.send(tenantId, id, userId, sendQuotationDto);
  }

  @Post(':id/respond')
  @Permissions('quotations.respond')
  @ApiOperation({ summary: 'Respond to quotation (accept/reject)' })
  @ApiResponse({ status: 200, description: 'Response recorded' })
  async respond(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() respondQuotationDto: RespondQuotationDto,
  ) {
    return this.quotationsService.respond(tenantId, id, userId, respondQuotationDto);
  }

  @Post(':id/revise')
  @Permissions('quotations.revise')
  @ApiOperation({ summary: 'Create revision of quotation' })
  @ApiResponse({ status: 201, description: 'Quotation revised', type: QuotationResponseDto })
  async revise(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.quotationsService.revise(tenantId, branchId, userId, id);
  }

  @Put(':id/convert')
  @Permissions('quotations.convert')
  @ApiOperation({ summary: 'Convert quotation to job/shipment' })
  @ApiResponse({ status: 200, description: 'Quotation converted' })
  async convert(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: { jobId?: string; shipmentId?: string },
  ) {
    return this.quotationsService.convert(tenantId, id, userId, body);
  }
}