import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, ComplianceRule, ComplianceEntityType, ComplianceRuleType, ComplianceSeverity, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateComplianceRuleDto, UpdateComplianceRuleDto, ComplianceRuleQueryDto, ComplianceRuleResponseDto, EvaluateComplianceDto, ComplianceEvaluationResultDto } from './dto/compliance-rule.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class ComplianceRulesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createComplianceRuleDto: CreateComplianceRuleDto,
  ): Promise<ComplianceRuleResponseDto> {
    const existingRule = await this.prisma.complianceRule.findUnique({
      where: { code_tenantId: { code: createComplianceRuleDto.code, tenantId } },
    });

    if (existingRule) {
      throw new ConflictException('Compliance rule code already exists in this tenant');
    }

    const rule = await this.prisma.complianceRule.create({
      data: {
        code: createComplianceRuleDto.code,
        name: createComplianceRuleDto.name,
        description: createComplianceRuleDto.description,
        entityType: createComplianceRuleDto.entityType,
        entityId: createComplianceRuleDto.entityId,
        ruleType: createComplianceRuleDto.ruleType,
        condition: createComplianceRuleDto.condition,
        action: createComplianceRuleDto.action,
        severity: createComplianceRuleDto.severity,
        priority: createComplianceRuleDto.priority || 0,
        validFrom: createComplianceRuleDto.validFrom,
        validUntil: createComplianceRuleDto.validUntil,
        tenantId,
        branchId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.publishEvent('compliance_rule.created', rule);

    return this.mapToResponse(rule);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: ComplianceRuleQueryDto,
  ): Promise<PaginatedResult<ComplianceRuleResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ComplianceRuleWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.entityType) {
      where.entityType = query.entityType as ComplianceEntityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.ruleType) {
      where.ruleType = query.ruleType as ComplianceRuleType;
    }

    if (query.severity) {
      where.severity = query.severity as ComplianceSeverity;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { priority: 'desc', createdAt: 'desc' };

    const [rules, total] = await Promise.all([
      this.prisma.complianceRule.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.complianceRule.count({ where }),
    ]);

    return {
      data: rules.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<ComplianceRuleResponseDto> {
    const rule = await this.prisma.complianceRule.findFirst({
      where: { id, tenantId, isDeleted: false },
    });

    if (!rule) {
      throw new NotFoundException('Compliance rule not found');
    }

    return this.mapToResponse(rule);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateComplianceRuleDto: UpdateComplianceRuleDto,
  ): Promise<ComplianceRuleResponseDto> {
    const rule = await this.findById(tenantId, id);

    const updatedRule = await this.prisma.complianceRule.update({
      where: { id },
      data: {
        ...updateComplianceRuleDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('compliance_rule.updated', updatedRule);

    return this.mapToResponse(updatedRule);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.complianceRule.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('compliance_rule.deleted', { id, tenantId });
  }

  async evaluate(
    tenantId: string,
    evaluateComplianceDto: EvaluateComplianceDto,
  ): Promise<ComplianceEvaluationResultDto[]> {
    const { entityType, entityId, context } = evaluateComplianceDto;

    const rules = await this.prisma.complianceRule.findMany({
      where: {
        tenantId,
        isDeleted: false,
        isActive: true,
        entityType: entityType as ComplianceEntityType,
        OR: [
          { entityId },
          { entityId: null },
        ],
        AND: [
          {
            OR: [
              { validFrom: null },
              { validFrom: { lte: new Date() } },
            ],
          },
          {
            OR: [
              { validUntil: null },
              { validUntil: { gte: new Date() } },
            ],
          },
        ],
      },
      orderBy: { priority: 'desc' },
    });

    const results: ComplianceEvaluationResultDto[] = [];

    for (const rule of rules) {
      const matched = this.evaluateCondition(rule.condition as Record<string, unknown>, context);

      if (matched) {
        results.push({
          ruleId: rule.id,
          ruleCode: rule.code,
          ruleName: rule.name,
          severity: rule.severity,
          matched: true,
          message: (rule.action as Record<string, unknown>).message as string || 'Rule matched',
          action: rule.action as Record<string, unknown>,
        });
      }
    }

    return results;
  }

  private evaluateCondition(condition: Record<string, unknown>, context: Record<string, unknown>): boolean {
    for (const [key, expectedValue] of Object.entries(condition)) {
      const actualValue = context[key];

      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) {
          return false;
        }
      } else if (typeof expectedValue === 'object' && expectedValue !== null) {
        if (!this.evaluateCondition(expectedValue as Record<string, unknown>, actualValue as Record<string, unknown>)) {
          return false;
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<ComplianceRuleResponseDto> {
    const rule = await this.findById(tenantId, id);

    const updatedRule = await this.prisma.complianceRule.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedRule);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'COMPLIANCE_RULE',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish compliance rule event:', error);
    }
  }

  private mapToResponse(rule: ComplianceRule): ComplianceRuleResponseDto {
    return {
      id: rule.id,
      code: rule.code,
      name: rule.name,
      description: rule.description,
      entityType: rule.entityType,
      entityId: rule.entityId,
      ruleType: rule.ruleType,
      condition: rule.condition as Record<string, unknown>,
      action: rule.action as Record<string, unknown>,
      severity: rule.severity,
      priority: rule.priority,
      isActive: rule.isActive,
      validFrom: rule.validFrom,
      validUntil: rule.validUntil,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}