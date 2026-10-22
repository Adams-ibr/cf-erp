import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Inspection, ExamType, InspectionStatus, ExamResult, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateInspectionDto, UpdateInspectionDto, InspectionQueryDto, InspectionResponseDto } from './dto/inspection.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class InspectionsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    entryId: string,
    userId: string,
    createInspectionDto: CreateInspectionDto,
  ): Promise<InspectionResponseDto> {
    const entry = await this.prisma.customsEntry.findFirst({
      where: { id: entryId, tenantId, isDeleted: false },
    });
    if (!entry) {
      throw new NotFoundException('Customs entry not found');
    }

    const inspection = await this.prisma.inspection.create({
      data: {
        customsEntryId: entryId,
        type: createInspectionDto.type,
        status: InspectionStatus.SCHEDULED,
        scheduledDate: createInspectionDto.scheduledDate,
        location: createInspectionDto.location,
        officer: createInspectionDto.officer,
        agency: createInspectionDto.agency,
        notes: createInspectionDto.notes,
        tenantId,
      },
    });

    if (entry.status === 'EXAMINATION_SCHEDULED') {
      await this.prisma.customsEntry.update({
        where: { id: entryId },
        data: { status: 'EXAMINATION_SCHEDULED' },
      });
    }

    await this.publishEvent('customs_inspection.scheduled', inspection);

    return this.mapToResponse(inspection);
  }

  async findAll(
    tenantId: string,
    entryId: string,
    query: InspectionQueryDto,
  ): Promise<PaginatedResult<InspectionResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.InspectionWhereInput = {
      customsEntryId: entryId,
    };

    if (query.type) {
      where.type = query.type as ExamType;
    }

    if (query.status) {
      where.status = query.status as InspectionStatus;
    }

    if (query.result) {
      where.result = query.result as ExamResult;
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { scheduledDate: 'asc' };

    const [inspections, total] = await Promise.all([
      this.prisma.inspection.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.inspection.count({ where }),
    ]);

    return {
      data: inspections.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, entryId: string, id: string): Promise<InspectionResponseDto> {
    const inspection = await this.prisma.inspection.findFirst({
      where: { id, customsEntryId: entryId },
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    return this.mapToResponse(inspection);
  }

  async update(
    tenantId: string,
    entryId: string,
    id: string,
    userId: string,
    updateInspectionDto: UpdateInspectionDto,
  ): Promise<InspectionResponseDto> {
    const inspection = await this.findById(tenantId, entryId, id);

    const updatedInspection = await this.prisma.inspection.update({
      where: { id },
      data: {
        ...updateInspectionDto,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedInspection);
  }

  async delete(tenantId: string, entryId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, entryId, id);

    await this.prisma.inspection.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    await this.publishEvent('customs_inspection.deleted', { id, tenantId });
  }

  async complete(
    tenantId: string,
    entryId: string,
    id: string,
    userId: string,
    body: { result: string; findings?: string; notes?: string },
  ): Promise<InspectionResponseDto> {
    const inspection = await this.findById(tenantId, entryId, id);

    if (inspection.status === InspectionStatus.COMPLETED) {
      throw new BadRequestException('Inspection already completed');
    }

    const validResults = Object.values(ExamResult);
    if (!validResults.includes(body.result as ExamResult)) {
      throw new BadRequestException('Invalid exam result');
    }

    const completedInspection = await this.prisma.inspection.update({
      where: { id },
      data: {
        status: InspectionStatus.COMPLETED,
        completedDate: new Date(),
        result: body.result as ExamResult,
        findings: body.findings,
        notes: body.notes ? `${inspection.notes || ''}\n${body.notes}` : inspection.notes,
      },
    });

    const entry = await this.prisma.customsEntry.findFirst({ where: { id: entryId } });
    if (entry && entry.status === 'EXAMINATION_SCHEDULED') {
      await this.prisma.customsEntry.update({
        where: { id: entryId },
        data: { status: 'EXAMINATION_COMPLETED' },
      });
    }

    await this.publishEvent('customs_inspection.completed', completedInspection);

    return this.mapToResponse(completedInspection);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'CUSTOMS_INSPECTION',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish customs inspection event:', error);
    }
  }

  private mapToResponse(inspection: Inspection): InspectionResponseDto {
    return {
      id: inspection.id,
      type: inspection.type,
      status: inspection.status,
      scheduledDate: inspection.scheduledDate,
      completedDate: inspection.completedDate,
      location: inspection.location,
      officer: inspection.officer,
      agency: inspection.agency,
      result: inspection.result,
      findings: inspection.findings,
      notes: inspection.notes,
      createdAt: inspection.createdAt,
      updatedAt: inspection.updatedAt,
    };
  }
}