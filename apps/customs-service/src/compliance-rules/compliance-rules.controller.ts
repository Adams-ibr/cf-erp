import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { ComplianceRulesService } from './compliance-rules.service';
import { CreateComplianceRuleDto, UpdateComplianceRuleDto, ComplianceRuleQueryDto, ComplianceRuleResponseDto, EvaluateComplianceDto } from './dto/compliance-rule.dto';

@ApiTags('Compliance Rules')
@Controller('compliance-rules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ComplianceRulesController {
  constructor(private readonly complianceRulesService: ComplianceRulesService) {}

  @Post()
  @Permissions('compliance_rules.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create compliance rule' })
  @ApiResponse({ status: 201, description: 'Compliance rule created', type: ComplianceRuleResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createComplianceRuleDto: CreateComplianceRuleDto,
  ) {
    return this.complianceRulesService.create(tenantId, branchId, userId, createComplianceRuleDto);
  }

  @Get()
  @Permissions('compliance_rules.read')
  @ApiOperation({ summary: 'List compliance rules' })
  @ApiResponse({ status: 200, description: 'Compliance rules list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: ComplianceRuleQueryDto,
  ) {
    return this.complianceRulesService.findAll(tenantId, branchId, query);
  }

  @Post('evaluate')
  @Permissions('compliance_rules.read')
  @ApiOperation({ summary: 'Evaluate compliance rules for entity' })
  @ApiResponse({ status: 200, description: 'Evaluation results' })
  async evaluate(
    @CurrentTenantId() tenantId: string,
    @Body() evaluateComplianceDto: EvaluateComplianceDto,
  ) {
    return this.complianceRulesService.evaluate(tenantId, evaluateComplianceDto);
  }

  @Get(':id')
  @Permissions('compliance_rules.read')
  @ApiOperation({ summary: 'Get compliance rule by ID' })
  @ApiResponse({ status: 200, description: 'Compliance rule details', type: ComplianceRuleResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.complianceRulesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('compliance_rules.update')
  @ApiOperation({ summary: 'Update compliance rule' })
  @ApiResponse({ status: 200, description: 'Compliance rule updated', type: ComplianceRuleResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateComplianceRuleDto: UpdateComplianceRuleDto,
  ) {
    return this.complianceRulesService.update(tenantId, id, userId, updateComplianceRuleDto);
  }

  @Delete(':id')
  @Permissions('compliance_rules.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete compliance rule' })
  @ApiResponse({ status: 200, description: 'Compliance rule deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.complianceRulesService.delete(tenantId, id, userId);
    return { message: 'Compliance rule deleted successfully' };
  }

  @Put(':id/activate')
  @Permissions('compliance_rules.update')
  @ApiOperation({ summary: 'Activate compliance rule' })
  @ApiResponse({ status: 200, description: 'Compliance rule activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.complianceRulesService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('compliance_rules.update')
  @ApiOperation({ summary: 'Deactivate compliance rule' })
  @ApiResponse({ status: 200, description: 'Compliance rule deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.complianceRulesService.setActive(tenantId, id, userId, false);
  }
}