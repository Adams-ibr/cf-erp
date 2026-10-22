import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Permissions, CurrentTenantId, CurrentBranchId, CurrentUserId } from '@cf-erp/auth';
import { ValidityRulesService } from './validity-rules.service';
import { CreateValidityRuleDto, UpdateValidityRuleDto, ValidityRuleQueryDto, ValidityRuleResponseDto } from './dto/validity-rule.dto';

@ApiTags('Validity Rules')
@Controller('validity-rules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ValidityRulesController {
  constructor(private readonly validityRulesService: ValidityRulesService) {}

  @Post()
  @Permissions('validity_rules.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create validity rule' })
  @ApiResponse({ status: 201, description: 'Validity rule created', type: ValidityRuleResponseDto })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @CurrentUserId() userId: string,
    @Body() createValidityRuleDto: CreateValidityRuleDto,
  ) {
    return this.validityRulesService.create(tenantId, branchId, userId, createValidityRuleDto);
  }

  @Get()
  @Permissions('validity_rules.read')
  @ApiOperation({ summary: 'List validity rules' })
  @ApiResponse({ status: 200, description: 'Validity rules list' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentBranchId() branchId: string | undefined,
    @Query() query: ValidityRuleQueryDto,
  ) {
    return this.validityRulesService.findAll(tenantId, branchId, query);
  }

  @Get(':id')
  @Permissions('validity_rules.read')
  @ApiOperation({ summary: 'Get validity rule by ID' })
  @ApiResponse({ status: 200, description: 'Validity rule details', type: ValidityRuleResponseDto })
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.validityRulesService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('validity_rules.update')
  @ApiOperation({ summary: 'Update validity rule' })
  @ApiResponse({ status: 200, description: 'Validity rule updated', type: ValidityRuleResponseDto })
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateValidityRuleDto: UpdateValidityRuleDto,
  ) {
    return this.validityRulesService.update(tenantId, id, userId, updateValidityRuleDto);
  }

  @Delete(':id')
  @Permissions('validity_rules.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete validity rule' })
  @ApiResponse({ status: 200, description: 'Validity rule deleted' })
  async delete(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    await this.validityRulesService.delete(tenantId, id, userId);
    return { message: 'Validity rule deleted successfully' };
  }

  @Put(':id/activate')
  @Permissions('validity_rules.update')
  @ApiOperation({ summary: 'Activate validity rule' })
  @ApiResponse({ status: 200, description: 'Validity rule activated' })
  async activate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.validityRulesService.setActive(tenantId, id, userId, true);
  }

  @Put(':id/deactivate')
  @Permissions('validity_rules.update')
  @ApiOperation({ summary: 'Deactivate validity rule' })
  @ApiResponse({ status: 200, description: 'Validity rule deactivated' })
  async deactivate(
    @CurrentTenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.validityRulesService.setActive(tenantId, id, userId, false);
  }
}