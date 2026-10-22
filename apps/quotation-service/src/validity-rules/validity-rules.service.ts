import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, ValidityRule, ValidityEntityType, ValidityRuleType, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateValidityRuleDto, UpdateValidityRuleDto, ValidityRuleQueryDto, ValidityRuleResponseDto } from './dto/validity-rule.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class ValidityRulesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createValidityRuleDto: CreateValidityRuleDto,
  ): Promise<ValidityRuleResponseDto> {
    const existingRule = await this.prisma.validityRule.findUnique({
      where: { code_tenantId: { code: createValidityRuleDto.code, tenantId } },
    });

    if (existingRule) {
      throw new ConflictException('Validity rule code already exists in this tenant');
    }

    if (createValidityRuleDto.validFrom && createValidityRuleDto.validUntil) {
      if (createValidityRuleDto.validFrom >= createValidityRuleDto.validUntil) {
        throw new ConflictException('Valid from must be before valid until');
      }
    }

    const rule = await this.prisma.validityRule.create({
      data: {
        code: createValidityRuleDto.code,
        name: createValidityRuleDto.name,
        description: createValidityRuleDto.description,
        entityType: createValidityRuleDto.entityType,
        entityId: createValidityRuleDto.entityId,
        ruleType: createValidityRuleDto.ruleType,
        condition: createValidityRuleDto.condition,
        action: createValidityRuleDto.action,
        priority: createValidityRuleDto.priority || 0,
        validFrom: createValidityRuleDto.validFrom,
        validUntil: createValidityRuleDto.validUntil,
        tenantId,
        branchId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.publishEvent('validity_rule.created', rule);

    return this.mapToResponse(rule);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: ValidityRuleQueryDto,
  ): Promise<PaginatedResult<ValidityRuleResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ValidityRuleWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.entityType) {
      where.entityType = query.entityType as ValidityEntityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.ruleType) {
      where.ruleType = query.ruleType as ValidityRuleType;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { priority: 'desc', createdAt: 'desc' };

    const [rules, total] = await Promise.all([
      this.prisma.validityRule.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.validityRule.count({ where }),
    ]);

    return {
      data: rules.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<ValidityRuleResponseDto> {
    const rule = await this.prisma.validityRule.findFirst({
      where: { id, tenantId, isDeleted: false },
    });

    if (!rule) {
      throw new NotFoundException('Validity rule not found');
    }

    return this.mapToResponse(rule);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateValidityRuleDto: UpdateValidityRuleDto,
  ): Promise<ValidityRuleResponseDto> {
    const rule = await this.findById(tenantId, id);

    if (updateValidityRuleDto.validFrom && updateValidityRuleDto.validUntil) {
      if (updateValidityRuleDto.validFrom >= updateValidityRuleDto.validUntil) {
        throw new ConflictException('Valid from must be before valid until');
      }
    }

    const updatedRule = await this.prisma.validityRule.update({
      where: { id },
      data: {
        ...updateValidityRuleDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('validity_rule.updated', updatedRule);

    return this.mapToResponse(updatedRule);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.validityRule.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('validity_rule.deleted', { id, tenantId });
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<ValidityRuleResponseDto> {
    const rule = await this.findById(tenantId, id);

    const updatedRule = await this.prisma.validityRule.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('validity_rule.status_changed', updatedRule);

    return this.mapToResponse(updatedRule);
  }

  async evaluateRules(
    tenantId: string,
    entityType: ValidityEntityType,
    entityId: string,
    context: Record<string, unknown>,
  ): Promise<ValidityRuleResponseDto[]> {
    const rules = await this.prisma.validityRule.findMany({
      where: {
        tenantId,
        isDeleted: false,
        isActive: true,
        entityType,
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

    const matchedRules: ValidityRuleResponseDto[] = [];

    for (const rule of rules) {
      if (this.evaluateCondition(rule.condition as Record<string, unknown>, context)) {
        matchedRules.push(this.mapToResponse(rule));
      }
    }

    return matchedRules;
  }

  private evaluateCondition(condition: Record<string, unknown>, context: Record<string, unknown>): boolean {
    // Simple condition evaluation - can be extended with a proper rule engine
    for (const [key, value] of Object.entries(condition)) {
      if (context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'VALIDITY_RULE',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish validity rule event:', error);
    }
  }

  private mapToResponse(rule: ValidityRule): ValidityRuleResponseDto {
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
      priority: rule.priority,
      isActive: rule.isActive,
      validFrom: rule.validFrom,
      validUntil: rule.validUntil,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}