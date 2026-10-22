import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Template, TemplateField, DocumentType, FieldType, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateTemplateDto, UpdateTemplateDto, CreateTemplateFieldDto, TemplateQueryDto, TemplateResponseDto } from './dto/template.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class TemplatesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createTemplateDto: CreateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const existingTemplate = await this.prisma.template.findUnique({
      where: { code_tenantId: { code: createTemplateDto.code, tenantId } },
    });

    if (existingTemplate) {
      throw new ConflictException('Template code already exists in this tenant');
    }

    const template = await this.prisma.$transaction(async (tx) => {
      const newTemplate = await tx.template.create({
        data: {
          code: createTemplateDto.code,
          name: createTemplateDto.name,
          description: createTemplateDto.description,
          type: createTemplateDto.type,
          category: createTemplateDto.category,
          content: createTemplateDto.content,
          isActive: true,
          version: 1,
          tenantId,
          branchId,
          createdBy: userId,
        },
      });

      if (createTemplateDto.fields && createTemplateDto.fields.length > 0) {
        await tx.templateField.createMany({
          data: createTemplateDto.fields.map((field, index) => ({
            templateId: newTemplate.id,
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required ?? false,
            defaultValue: field.defaultValue,
            options: field.options || [],
            validation: field.validation,
            sortOrder: field.sortOrder ?? index,
            tenantId,
          })),
        });
      }

      return newTemplate;
    });

    await this.publishEvent('template.created', template);

    return this.findById(tenantId, template.id);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: TemplateQueryDto,
  ): Promise<PaginatedResult<TemplateResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TemplateWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.type) {
      where.type = query.type as DocumentType;
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
      : { name: 'asc' };

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          fields: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { documents: true } },
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data: templates.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<TemplateResponseDto> {
    const template = await this.prisma.template.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        fields: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.mapToResponse(template);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const template = await this.findById(tenantId, id);

    const updatedTemplate = await this.prisma.template.update({
      where: { id },
      data: {
        ...updateTemplateDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        fields: { orderBy: { sortOrder: 'asc' } },
      },
    });

    await this.publishEvent('template.updated', updatedTemplate);

    return this.mapToResponse(updatedTemplate);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const template = await this.findById(tenantId, id);

    const documents = await this.prisma.document.count({
      where: { templateId: id, isDeleted: false },
    });

    if (documents > 0) {
      throw new BadRequestException('Cannot delete template used by documents');
    }

    await this.prisma.template.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('template.deleted', { id, tenantId });
  }

  async addField(
    tenantId: string,
    templateId: string,
    userId: string,
    createTemplateFieldDto: CreateTemplateFieldDto,
  ): Promise<TemplateField> {
    const template = await this.findById(tenantId, templateId);

    if (!template.isActive) {
      throw new BadRequestException('Cannot add fields to inactive template');
    }

    const maxSortOrder = await this.prisma.templateField.aggregate({
      where: { templateId },
      _max: { sortOrder: true },
    });

    const field = await this.prisma.templateField.create({
      data: {
        templateId,
        name: createTemplateFieldDto.name,
        label: createTemplateFieldDto.label,
        type: createTemplateFieldDto.type,
        required: createTemplateFieldDto.required ?? false,
        defaultValue: createTemplateFieldDto.defaultValue,
        options: createTemplateFieldDto.options || [],
        validation: createTemplateFieldDto.validation,
        sortOrder: createTemplateFieldDto.sortOrder ?? (maxSortOrder._max.sortOrder || 0) + 1,
        tenantId,
      },
    });

    await this.prisma.template.update({
      where: { id: templateId },
      data: { version: { increment: 1 } },
    });

    return field;
  }

  async removeField(tenantId: string, templateId: string, fieldId: string, userId: string): Promise<void> {
    await this.findById(tenantId, templateId);

    const field = await this.prisma.templateField.findFirst({
      where: { id: fieldId, templateId },
    });

    if (!field) {
      throw new NotFoundException('Template field not found');
    }

    await this.prisma.templateField.delete({ where: { id: fieldId } });

    await this.prisma.template.update({
      where: { id: templateId },
      data: { version: { increment: 1 } },
    });
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<TemplateResponseDto> {
    const template = await this.findById(tenantId, id);

    const updatedTemplate = await this.prisma.template.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        fields: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return this.mapToResponse(updatedTemplate);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'TEMPLATE',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish template event:', error);
    }
  }

  private mapToResponse(template: Template & { fields?: TemplateField[] }): TemplateResponseDto {
    return {
      id: template.id,
      code: template.code,
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      content: template.content as Record<string, unknown>,
      fields: template.fields?.map(f => ({
        id: f.id,
        name: f.name,
        label: f.label,
        type: f.type,
        required: f.required,
        defaultValue: f.defaultValue,
        options: f.options as string[],
        validation: f.validation as Record<string, unknown> | undefined,
        sortOrder: f.sortOrder,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })) || [],
      isActive: template.isActive,
      version: template.version,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}