import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Job, JobStatus, JobType, JobPriority, ShipmentMode, ShipmentDirection, Incoterm, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateJobDto, UpdateJobDto, JobQueryDto, JobResponseDto, CreateJobLegDto } from './dto/job.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient, EventTypes } from '@cf-erp/messaging';

@Injectable()
export class JobsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createJobDto: CreateJobDto,
  ): Promise<JobResponseDto> {
    const existingJob = await this.prisma.job.findUnique({
      where: { code_tenantId: { code: createJobDto.code, tenantId } },
    });

    if (existingJob) {
      throw new ConflictException('Job code already exists in this tenant');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: createJobDto.customerId, tenantId, isDeleted: false },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (createJobDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createJobDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    if (createJobDto.salesRepId) {
      const salesRep = await this.prisma.user.findFirst({
        where: { id: createJobDto.salesRepId, tenantId, isActive: true },
      });
      if (!salesRep) {
        throw new NotFoundException('Sales rep not found');
      }
    }

    if (createJobDto.operationsRepId) {
      const opsRep = await this.prisma.user.findFirst({
        where: { id: createJobDto.operationsRepId, tenantId, isActive: true },
      });
      if (!opsRep) {
        throw new NotFoundException('Operations rep not found');
      }
    }

    if (createJobDto.quotationId) {
      const quotation = await this.prisma.quotation.findFirst({
        where: { id: createJobDto.quotationId, tenantId, isDeleted: false },
      });
      if (!quotation) {
        throw new NotFoundException('Quotation not found');
      }
    }

    if (createJobDto.rateCardId) {
      const rateCard = await this.prisma.rateCard.findFirst({
        where: { id: createJobDto.rateCardId, tenantId, isDeleted: false },
      });
      if (!rateCard) {
        throw new NotFoundException('Rate card not found');
      }
    }

    const job = await this.prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          code: createJobDto.code,
          reference: createJobDto.reference,
          type: createJobDto.type || JobType.FREIGHT_FORWARDING,
          status: createJobDto.status || JobStatus.DRAFT,
          priority: createJobDto.priority || JobPriority.MEDIUM,
          mode: createJobDto.mode || ShipmentMode.SEA_FCL,
          direction: createJobDto.direction || ShipmentDirection.IMPORT,
          incoterm: createJobDto.incoterm || Incoterm.FOB,
          currency: createJobDto.currency || 'USD',
          exchangeRate: createJobDto.exchangeRate ? new Prisma.Decimal(createJobDto.exchangeRate) : new Prisma.Decimal(1),
          customerId: createJobDto.customerId,
          supplierId: createJobDto.supplierId,
          salesRepId: createJobDto.salesRepId,
          operationsRepId: createJobDto.operationsRepId,
          origin: createJobDto.origin,
          destination: createJobDto.destination,
          commodity: createJobDto.commodity,
          weight: createJobDto.weight ? new Prisma.Decimal(createJobDto.weight) : null,
          volume: createJobDto.volume ? new Prisma.Decimal(createJobDto.volume) : null,
          quantity: createJobDto.quantity,
          unit: createJobDto.unit,
          value: createJobDto.value ? new Prisma.Decimal(createJobDto.value) : null,
          insuranceValue: createJobDto.insuranceValue ? new Prisma.Decimal(createJobDto.insuranceValue) : null,
          pickupDate: createJobDto.pickupDate,
          deliveryDate: createJobDto.deliveryDate,
          cutoffDate: createJobDto.cutoffDate,
          estimatedDeparture: createJobDto.estimatedDeparture,
          estimatedArrival: createJobDto.estimatedArrival,
          notes: createJobDto.notes,
          internalNotes: createJobDto.internalNotes,
          quotationId: createJobDto.quotationId,
          rateCardId: createJobDto.rateCardId,
          tenantId,
          branchId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (createJobDto.legs && createJobDto.legs.length > 0) {
        await tx.jobLeg.createMany({
          data: createJobDto.legs.map(leg => ({
            jobId: newJob.id,
            sequence: leg.sequence,
            type: leg.type as any,
            mode: leg.mode,
            origin: leg.origin,
            destination: leg.destination,
            carrierId: leg.carrierId,
            vesselId: leg.vesselId,
            voyageId: leg.voyageId,
            etd: leg.etd,
            eta: leg.eta,
            tenantId,
          })),
        });
      }

      return newJob;
    });

    await this.publishEvent(EventTypes.JOB.CREATED, job);

    return this.findById(tenantId, job.id);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: JobQueryDto,
  ): Promise<PaginatedResult<JobResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.status) {
      where.status = query.status as JobStatus;
    }

    if (query.type) {
      where.type = query.type as JobType;
    }

    if (query.priority) {
      where.priority = query.priority as JobPriority;
    }

    if (query.mode) {
      where.mode = query.mode as ShipmentMode;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.salesRepId) {
      where.salesRepId = query.salesRepId;
    }

    if (query.operationsRepId) {
      where.operationsRepId = query.operationsRepId;
    }

    if (query.origin) {
      where.origin = { contains: query.origin, mode: 'insensitive' };
    }

    if (query.destination) {
      where.destination = { contains: query.destination, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
        { origin: { contains: query.search, mode: 'insensitive' } },
        { destination: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          legs: { orderBy: { sequence: 'asc' } },
          customer: true,
          supplier: true,
          salesRep: true,
          operationsRep: true,
          _count: { select: { shipments: true, documents: true, tasks: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<JobResponseDto> {
    const job = await this.prisma.job.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        legs: { orderBy: { sequence: 'asc' } },
        customer: true,
        supplier: true,
        salesRep: true,
        operationsRep: true,
        quotation: true,
        rateCard: true,
        shipments: true,
        milestones: true,
        _count: { select: { shipments: true, documents: true, tasks: true, activities: true } },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.mapToResponse(job);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateJobDto: UpdateJobDto,
  ): Promise<JobResponseDto> {
    const job = await this.findById(tenantId, id);

    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
      throw new BadRequestException('Cannot update completed or cancelled job');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        ...updateJobDto,
        exchangeRate: updateJobDto.exchangeRate ? new Prisma.Decimal(updateJobDto.exchangeRate) : undefined,
        weight: updateJobDto.weight ? new Prisma.Decimal(updateJobDto.weight) : undefined,
        volume: updateJobDto.volume ? new Prisma.Decimal(updateJobDto.volume) : undefined,
        value: updateJobDto.value ? new Prisma.Decimal(updateJobDto.value) : undefined,
        insuranceValue: updateJobDto.insuranceValue ? new Prisma.Decimal(updateJobDto.insuranceValue) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        legs: { orderBy: { sequence: 'asc' } },
        customer: true,
        supplier: true,
        salesRep: true,
        operationsRep: true,
      },
    });

    await this.publishEvent(EventTypes.JOB.UPDATED, updatedJob);

    return this.mapToResponse(updatedJob);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const job = await this.findById(tenantId, id);

    if (job.status === JobStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete completed job');
    }

    const shipments = await this.prisma.shipment.count({
      where: { jobId: id, isDeleted: false },
    });

    if (shipments > 0) {
      throw new BadRequestException('Cannot delete job with associated shipments');
    }

    await this.prisma.job.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent(EventTypes.JOB.DELETED, { id, tenantId });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    userId: string,
    status: string,
    notes?: string,
  ): Promise<JobResponseDto> {
    const job = await this.findById(tenantId, id);

    const validStatuses = Object.values(JobStatus);
    if (!validStatuses.includes(status as JobStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const newStatus = status as JobStatus;

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['QUOTE_REQUESTED', 'BOOKED', 'CANCELLED'],
      QUOTE_REQUESTED: ['QUOTED', 'CANCELLED', 'DRAFT'],
      QUOTED: ['BOOKED', 'CANCELLED', 'QUOTE_REQUESTED'],
      BOOKED: ['CONFIRMED', 'CANCELLED', 'QUOTED'],
      CONFIRMED: ['DOCUMENTS_PENDING', 'CANCELLED', 'BOOKED'],
      DOCUMENTS_PENDING: ['DOCUMENTS_RECEIVED', 'CANCELLED'],
      DOCUMENTS_RECEIVED: ['CUSTOMS_PENDING', 'LOADED', 'CANCELLED'],
      CUSTOMS_PENDING: ['CUSTOMS_CLEARED', 'CUSTOMS_HOLD', 'CANCELLED'],
      CUSTOMS_CLEARED: ['LOADED', 'CUSTOMS_HOLD', 'CANCELLED'],
      CUSTOMS_HOLD: ['CUSTOMS_CLEARED', 'CUSTOMS_EXAM', 'CANCELLED'],
      CUSTOMS_EXAM: ['CUSTOMS_CLEARED', 'CANCELLED'],
      LOADED: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['ARRIVED', 'ON_HOLD', 'PROBLEM'],
      ARRIVED: ['UNLOADED', 'CUSTOMS_PENDING', 'ON_HOLD', 'PROBLEM'],
      UNLOADED: ['DELIVERED', 'CUSTOMS_PENDING', 'ON_HOLD'],
      DELIVERED: ['COMPLETED', 'ON_HOLD'],
      COMPLETED: [],
      CANCELLED: ['DRAFT'],
      ON_HOLD: ['IN_TRANSIT', 'ARRIVED', 'UNLOADED', 'DELIVERED', 'CANCELLED'],
      PROBLEM: ['IN_TRANSIT', 'ARRIVED', 'UNLOADED', 'DELIVERED', 'CANCELLED'],
    };

    if (!validTransitions[job.status]?.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${job.status} to ${newStatus}`);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: newStatus === JobStatus.COMPLETED ? new Date() : null,
        cancelledAt: newStatus === JobStatus.CANCELLED ? new Date() : null,
        cancelReason: newStatus === JobStatus.CANCELLED ? notes : null,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        legs: { orderBy: { sequence: 'asc' } },
        customer: true,
        supplier: true,
        salesRep: true,
        operationsRep: true,
      },
    });

    // Create milestone for status change
    await this.prisma.milestone.create({
      data: {
        code: `MS-${newStatus}`,
        name: newStatus.replace(/_/g, ' '),
        type: newStatus as any,
        jobId: id,
        plannedDate: new Date(),
        actualDate: new Date(),
        status: 'COMPLETED',
        completedBy: userId,
        notes,
        tenantId: job.tenantId,
      },
    });

    await this.publishEvent(EventTypes.JOB.STATUS_CHANGED, {
      ...updatedJob,
      previousStatus: job.status,
    });

    return this.mapToResponse(updatedJob);
  }

  async addLeg(
    tenantId: string,
    jobId: string,
    userId: string,
    body: { sequence: number; type: string; mode: string; origin: string; destination: string; carrierId?: string; vesselId?: string; voyageId?: string; etd?: Date; eta?: Date },
  ): Promise<any> {
    const job = await this.findById(tenantId, jobId);

    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
      throw new BadRequestException('Cannot add legs to completed or cancelled job');
    }

    const existingLeg = await this.prisma.jobLeg.findUnique({
      where: { jobId_sequence: { jobId, sequence: body.sequence } },
    });

    if (existingLeg) {
      throw new ConflictException('Leg sequence already exists');
    }

    return this.prisma.jobLeg.create({
      data: {
        jobId,
        sequence: body.sequence,
        type: body.type as any,
        mode: body.mode as any,
        origin: body.origin,
        destination: body.destination,
        carrierId: body.carrierId,
        vesselId: body.vesselId,
        voyageId: body.voyageId,
        etd: body.etd,
        eta: body.eta,
        tenantId,
      },
    });
  }

  async removeLeg(tenantId: string, jobId: string, legId: string, userId: string): Promise<void> {
    await this.findById(tenantId, jobId);

    const leg = await this.prisma.jobLeg.findFirst({
      where: { id: legId, jobId },
    });

    if (!leg) {
      throw new NotFoundException('Leg not found');
    }

    await this.prisma.jobLeg.delete({ where: { id: legId } });
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.JobWhereInput = { tenantId, isDeleted: false };
    if (branchId) where.branchId = branchId;

    const [total, byStatus, byType, byPriority, byMode, completedThisMonth] = await Promise.all([
      this.prisma.job.count({ where }),
      this.prisma.job.groupBy({ by: ['status'], where, _count: { status: true } }),
      this.prisma.job.groupBy({ by: ['type'], where, _count: { type: true } }),
      this.prisma.job.groupBy({ by: ['priority'], where, _count: { priority: true } }),
      this.prisma.job.groupBy({ by: ['mode'], where, _count: { mode: true } }),
      this.prisma.job.count({
        where: {
          ...where,
          status: JobStatus.COMPLETED,
          completedAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item._count.status }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.type }), {}),
      byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item.priority]: item._count.priority }), {}),
      byMode: byMode.reduce((acc, item) => ({ ...acc, [item.mode]: item._count.mode }), {}),
      completedThisMonth,
    };
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'JOB',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish job event:', error);
    }
  }

  private mapToResponse(job: Job & {
    legs?: any[];
    customer?: any;
    supplier?: any;
    salesRep?: any;
    operationsRep?: any;
    quotation?: any;
    rateCard?: any;
    shipments?: any[];
    milestones?: any[];
    _count?: any;
  }): JobResponseDto {
    return {
      id: job.id,
      code: job.code,
      reference: job.reference,
      type: job.type,
      status: job.status,
      priority: job.priority,
      mode: job.mode,
      direction: job.direction,
      incoterm: job.incoterm,
      currency: job.currency,
      exchangeRate: job.exchangeRate.toNumber(),
      customerId: job.customerId,
      supplierId: job.supplierId,
      salesRepId: job.salesRepId,
      operationsRepId: job.operationsRepId,
      origin: job.origin,
      destination: job.destination,
      commodity: job.commodity,
      weight: job.weight?.toNumber(),
      volume: job.volume?.toNumber(),
      quantity: job.quantity,
      unit: job.unit,
      value: job.value?.toNumber(),
      insuranceValue: job.insuranceValue?.toNumber(),
      pickupDate: job.pickupDate,
      deliveryDate: job.deliveryDate,
      cutoffDate: job.cutoffDate,
      estimatedDeparture: job.estimatedDeparture,
      estimatedArrival: job.estimatedArrival,
      actualDeparture: job.actualDeparture,
      actualArrival: job.actualArrival,
      notes: job.notes,
      internalNotes: job.internalNotes,
      quotationId: job.quotationId,
      rateCardId: job.rateCardId,
      approvedBy: job.approvedBy,
      approvedAt: job.approvedAt,
      completedAt: job.completedAt,
      cancelledAt: job.cancelledAt,
      cancelReason: job.cancelReason,
      legs: job.legs?.map(leg => ({
        id: leg.id,
        sequence: leg.sequence,
        type: leg.type,
        mode: leg.mode,
        origin: leg.origin,
        destination: leg.destination,
        carrierId: leg.carrierId,
        vesselId: leg.vesselId,
        voyageId: leg.voyageId,
        etd: leg.etd,
        eta: leg.eta,
        atd: leg.atd,
        ata: leg.ata,
        status: leg.status,
        notes: leg.notes,
        createdAt: leg.createdAt,
        updatedAt: leg.updatedAt,
      })),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}