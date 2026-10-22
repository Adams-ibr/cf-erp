import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, CustomsEntry, CustomsEntryType, CustomsStatus, ExamType, ExamResult, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateCustomsEntryDto, UpdateCustomsEntryDto, CustomsEntryQueryDto, CustomsEntryResponseDto, FileCustomsEntryDto, ClearCustomsEntryDto, HoldCustomsEntryDto, ReleaseCustomsEntryDto, AmendCustomsEntryDto } from './dto/customs-entry.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class CustomsEntriesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createCustomsEntryDto: CreateCustomsEntryDto,
  ): Promise<CustomsEntryResponseDto> {
    const existingEntry = await this.prisma.customsEntry.findUnique({
      where: { code_tenantId: { code: createCustomsEntryDto.code, tenantId } },
    });

    if (existingEntry) {
      throw new ConflictException('Customs entry code already exists in this tenant');
    }

    const shipment = await this.prisma.shipment.findFirst({
      where: { id: createCustomsEntryDto.shipmentId, tenantId, isDeleted: false },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (createCustomsEntryDto.jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: createCustomsEntryDto.jobId, tenantId, isDeleted: false },
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
    }

    if (createCustomsEntryDto.bookingId) {
      const booking = await this.prisma.booking.findFirst({
        where: { id: createCustomsEntryDto.bookingId, tenantId, isDeleted: false },
      });
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: createCustomsEntryDto.customerId, tenantId, isDeleted: false },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (createCustomsEntryDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createCustomsEntryDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    if (createCustomsEntryDto.brokerId) {
      const broker = await this.prisma.customsBroker.findFirst({
        where: { id: createCustomsEntryDto.brokerId, tenantId, isDeleted: false },
      });
      if (!broker) {
        throw new NotFoundException('Customs broker not found');
      }
    }

    const entry = await this.prisma.$transaction(async (tx) => {
      let totalDuty = new Prisma.Decimal(0);
      let totalTax = new Prisma.Decimal(0);
      let totalFees = new Prisma.Decimal(0);

      const newEntry = await tx.customsEntry.create({
        data: {
          code: createCustomsEntryDto.code,
          reference: createCustomsEntryDto.reference,
          type: createCustomsEntryDto.type,
          status: CustomsStatus.NOT_STARTED,
          shipmentId: createCustomsEntryDto.shipmentId,
          jobId: createCustomsEntryDto.jobId,
          bookingId: createCustomsEntryDto.bookingId,
          customerId: createCustomsEntryDto.customerId,
          supplierId: createCustomsEntryDto.supplierId,
          brokerId: createCustomsEntryDto.brokerId,
          carrierId: createCustomsEntryDto.carrierId,
          vesselId: createCustomsEntryDto.vesselId,
          voyageId: createCustomsEntryDto.voyageId,
          containerId: createCustomsEntryDto.containerId,
          originCountry: createCustomsEntryDto.originCountry,
          destinationCountry: createCustomsEntryDto.destinationCountry,
          portOfEntry: createCustomsEntryDto.portOfEntry,
          portOfExit: createCustomsEntryDto.portOfExit,
          incoterm: createCustomsEntryDto.incoterm || Incoterm.FOB,
          currency: createCustomsEntryDto.currency || 'USD',
          exchangeRate: createCustomsEntryDto.exchangeRate ? new Prisma.Decimal(createCustomsEntryDto.exchangeRate) : new Prisma.Decimal(1),
          totalValue: new Prisma.Decimal(createCustomsEntryDto.totalValue),
          notes: createCustomsEntryDto.notes,
          internalNotes: createCustomsEntryDto.internalNotes,
          tenantId,
          branchId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (createCustomsEntryDto.lines && createCustomsEntryDto.lines.length > 0) {
        for (const line of createCustomsEntryDto.lines) {
          const dutyAmount = line.value * (line.dutyRate || 0);
          const taxAmount = line.value * (line.taxRate || 0);

          totalDuty = totalDuty.add(new Prisma.Decimal(dutyAmount));
          totalTax = totalTax.add(new Prisma.Decimal(taxAmount));

          await tx.customsEntryLine.create({
            data: {
              customsEntryId: newEntry.id,
              lineNumber: line.lineNumber,
              tariffCodeId: line.tariffCodeId,
              description: line.description,
              quantity: new Prisma.Decimal(line.quantity),
              unit: line.unit,
              weight: line.weight ? new Prisma.Decimal(line.weight) : null,
              value: new Prisma.Decimal(line.value),
              originCountry: line.originCountry,
              dutyRate: line.dutyRate ? new Prisma.Decimal(line.dutyRate) : new Prisma.Decimal(0),
              dutyAmount: new Prisma.Decimal(dutyAmount),
              taxRate: line.taxRate ? new Prisma.Decimal(line.taxRate) : new Prisma.Decimal(0),
              taxAmount: new Prisma.Decimal(taxAmount),
              preferentialRate: line.preferentialRate || false,
              tradeAgreementId: line.tradeAgreementId,
              isHazardous: line.isHazardous || false,
              unNumber: line.unNumber,
              imdgClass: line.imdgClass,
              packingGroup: line.packingGroup,
            },
          });
        }
      }

      const totalPayable = totalDuty.add(totalTax).add(totalFees);

      return tx.customsEntry.update({
        where: { id: newEntry.id },
        data: {
          totalDuty,
          totalTax,
          totalFees,
          totalPayable,
          balanceAmount: totalPayable,
        },
        include: {
          lines: true,
        },
      });
    });

    await this.publishEvent('customs_entry.created', entry);

    return this.findById(tenantId, entry.id);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: CustomsEntryQueryDto,
  ): Promise<PaginatedResult<CustomsEntryResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomsEntryWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.type) {
      where.type = query.type as CustomsEntryType;
    }

    if (query.status) {
      where.status = query.status as CustomsStatus;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.brokerId) {
      where.brokerId = query.brokerId;
    }

    if (query.shipmentId) {
      where.shipmentId = query.shipmentId;
    }

    if (query.jobId) {
      where.jobId = query.jobId;
    }

    if (query.bookingId) {
      where.bookingId = query.bookingId;
    }

    if (query.containerId) {
      where.containerId = query.containerId;
    }

    if (query.portOfEntry) {
      where.portOfEntry = query.portOfEntry;
    }

    if (query.filingDateFrom || query.filingDateTo) {
      where.filingDate = {};
      if (query.filingDateFrom) where.filingDate.gte = query.filingDateFrom;
      if (query.filingDateTo) where.filingDate.lte = query.filingDateTo;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
        { entryNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [entries, total] = await Promise.all([
      this.prisma.customsEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          lines: true,
          documents: true,
          inspections: true,
          fees: true,
          customer: true,
          supplier: true,
          broker: true,
          carrier: true,
          vessel: true,
          voyage: true,
        },
      }),
      this.prisma.customsEntry.count({ where }),
    ]);

    return {
      data: entries.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<CustomsEntryResponseDto> {
    const entry = await this.prisma.customsEntry.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        lines: { include: { tariffCode: true } },
        documents: true,
        inspections: true,
        fees: true,
        payments: true,
        customer: true,
        supplier: true,
        broker: true,
        carrier: true,
        vessel: true,
        voyage: true,
        container: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Customs entry not found');
    }

    return this.mapToResponse(entry);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateCustomsEntryDto: UpdateCustomsEntryDto,
  ): Promise<CustomsEntryResponseDto> {
    const entry = await this.findById(tenantId, id);

    if (entry.status === CustomsStatus.CLEARED || entry.status === CustomsStatus.RELEASED || entry.status === CustomsStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cleared, released, or cancelled customs entry');
    }

    if (updateCustomsEntryDto.brokerId && updateCustomsEntryDto.brokerId !== entry.brokerId) {
      const broker = await this.prisma.customsBroker.findFirst({
        where: { id: updateCustomsEntryDto.brokerId, tenantId, isDeleted: false },
      });
      if (!broker) {
        throw new NotFoundException('Customs broker not found');
      }
    }

    const updatedEntry = await this.prisma.customsEntry.update({
      where: { id },
      data: {
        ...updateCustomsEntryDto,
        exchangeRate: updateCustomsEntryDto.exchangeRate ? new Prisma.Decimal(updateCustomsEntryDto.exchangeRate) : undefined,
        totalValue: updateCustomsEntryDto.totalValue ? new Prisma.Decimal(updateCustomsEntryDto.totalValue) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        lines: { include: { tariffCode: true } },
        documents: true,
        inspections: true,
        fees: true,
        customer: true,
        supplier: true,
        broker: true,
      },
    });

    await this.publishEvent('customs_entry.updated', updatedEntry);

    return this.mapToResponse(updatedEntry);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const entry = await this.findById(tenantId, id);

    if (entry.status === CustomsStatus.CLEARED || entry.status === CustomsStatus.RELEASED) {
      throw new BadRequestException('Cannot delete cleared or released customs entry');
    }

    await this.prisma.customsEntry.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('customs_entry.deleted', { id, tenantId });
  }

  async file(tenantId: string, id: string, userId: string, fileCustomsEntryDto: FileCustomsEntryDto): Promise<CustomsEntryResponseDto> {
    const entry = await this.findById(tenantId, id);

    if (entry.status !== CustomsStatus.NOT_STARTED && entry.status !== CustomsStatus.DOCUMENTS_PREPARING) {
      throw new BadRequestException('Can only file entries in NOT_STARTED or DOCUMENTS_PREPARING status');
    }

    const updatedEntry = await this.prisma.customsEntry.update({
      where: { id },
      data: {
        status: CustomsStatus.DOCUMENTS_SUBMITTED,
        filingDate: new Date(),
        filedBy: fileCustomsEntryDto.brokerId || userId,
        internalNotes: fileCustomsEntryDto.notes ? `${entry.internalNotes || ''}\nFiled: ${fileCustomsEntryDto.notes}` : entry.internalNotes,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        lines: { include: { tariffCode: true } },
        documents: true,
        inspections: true,
        fees: true,
      },
    });

    await this.publishEvent('customs_entry.filed', updatedEntry);

    return this.mapToResponse(updatedEntry);
  }

  async clear(tenantId: string, id: string, userId: string, clearCustomsEntryDto: ClearCustomsEntryDto): Promise<CustomsEntryResponseDto> {
    const entry = await this.findById(tenantId, id);

    if (entry.status !== CustomsStatus.PAYMENT_COMPLETED && entry.status !== CustomsStatus.ASSESSMENT_COMPLETED) {
      throw new BadRequestException('Can only clear entries with completed payment or assessment');
    }

    const updatedEntry = await this.prisma.customsEntry.update({
      where: { id },
      data: {
        status: CustomsStatus.CLEARED,
        clearanceDate: new Date(),
        clearedBy: userId,
        internalNotes: clearCustomsEntryDto.notes ? `${entry.internalNotes || ''}\nCleared: ${clearCustomsEntryDto.notes}` : entry.internalNotes,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        lines: { include: { tariffCode: true } },
        documents: true,
        inspections: true,
        fees: true,
      },
    });

    await this.publishEvent('customs_entry.cleared', updatedEntry);

    return this.mapToResponse(updatedEntry);
  }

  async hold(tenantId: string, id: string, userId: string, holdCustomsEntryDto: HoldCustomsEntryDto): Promise<CustomsEntryResponseDto> {
    const entry = await this.findById(tenantId, id);

    if (entry.status === CustomsStatus.HOLD || entry.status === CustomsStatus.SEIZED) {
      throw new BadRequestException('Entry already on hold or seized');
    }

    if (entry.status === CustomsStatus.CLEARED || entry.status === CustomsStatus.RELEASED || entry.status === CustomsStatus.CANCELLED) {
      throw new BadRequestException('Cannot hold cleared, released, or cancelled entry');
    }

    const updatedEntry = await this.prisma.customsEntry.update({
      where: { id },
      data: {
        status: CustomsStatus.HOLD,
        holdReason: holdCustomsEntryDto.reason,
        internalNotes: `${entry.internalNotes || ''}\nOn hold: ${holdCustomsEntryDto.reason}`,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        lines: { include: { tariffCode: true } },
        documents: true,
        inspections: true,
        fees: true,
      },
    });

    return this.mapToResponse(updatedEntry);
  }

  async release(tenantId: string, id: string, userId: string, releaseCustomsEntryDto: ReleaseCustomsEntryDto): Promise<CustomsEntryResponseDto> {
    const entry = await this.findById(tenantId, id);

    if (entry.status !== CustomsStatus.HOLD) {
      throw new BadRequestException('Entry is not on hold');
    }

    const updatedEntry = await this.prisma.customsEntry.update({
      where: { id },
      data: {
        status: CustomsStatus.UNDER_REVIEW,
        holdReason: null,
        internalNotes: releaseCustomsEntryDto.notes ? `${entry.internalNotes || ''}\nReleased from hold: ${releaseCustomsEntryDto.notes}` : entry.internalNotes,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        lines: { include: { tariffCode: true } },
        documents: true,
        inspections: true,
        fees: true,
      },
    });

    return this.mapToResponse(updatedEntry);
  }

  async amend(tenantId: string, id: string, userId: string, amendCustomsEntryDto: AmendCustomsEntryDto): Promise<CustomsEntryResponseDto> {
    const entry = await this.findById(tenantId, id);

    if (entry.status === CustomsStatus.CLEARED || entry.status === CustomsStatus.RELEASED || entry.status === CustomsStatus.SEIZED || entry.status === CustomsStatus.CANCELLED) {
      throw new BadRequestException('Cannot amend cleared, released, seized, or cancelled entry');
    }

    if (amendCustomsEntryDto.newCode && amendCustomsEntryDto.newCode !== entry.code) {
      const existingEntry = await this.prisma.customsEntry.findUnique({
        where: { code_tenantId: { code: amendCustomsEntryDto.newCode, tenantId } },
      });
      if (existingEntry) {
        throw new ConflictException('Customs entry code already exists');
      }
    }

    const updatedEntry = await this.prisma.customsEntry.update({
      where: { id },
      data: {
        code: amendCustomsEntryDto.newCode || entry.code,
        status: amendCustomsEntryDto.newStatus || CustomsStatus.AMENDED,
        internalNotes: amendCustomsEntryDto.reason ? `${entry.internalNotes || ''}\nAmended: ${amendCustomsEntryDto.reason}` : entry.internalNotes,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        lines: { include: { tariffCode: true } },
        documents: true,
        inspections: true,
        fees: true,
      },
    });

    await this.publishEvent('customs_entry.amended', updatedEntry);

    return this.mapToResponse(updatedEntry);
  }

  async addLine(
    tenantId: string,
    id: string,
    userId: string,
    body: { lineNumber: number; tariffCodeId?: string; description: string; quantity: number; unit: string; weight?: number; value: number; originCountry: string; dutyRate?: number; taxRate?: number; preferentialRate?: boolean; tradeAgreementId?: string; isHazardous?: boolean; unNumber?: string; imdgClass?: string; packingGroup?: string },
  ): Promise<any> {
    const entry = await this.findById(tenantId, id);

    if (entry.status !== CustomsStatus.NOT_STARTED && entry.status !== CustomsStatus.DOCUMENTS_PREPARING) {
      throw new BadRequestException('Can only add lines to entries in preparation');
    }

    const existingLine = await this.prisma.customsEntryLine.findUnique({
      where: { customsEntryId_lineNumber: { customsEntryId: id, lineNumber: body.lineNumber } },
    });

    if (existingLine) {
      throw new ConflictException('Line number already exists');
    }

    if (body.tariffCodeId) {
      const tariffCode = await this.prisma.tariffCode.findFirst({
        where: { id: body.tariffCodeId, tenantId, isDeleted: false },
      });
      if (!tariffCode) {
        throw new NotFoundException('Tariff code not found');
      }
    }

    if (body.tradeAgreementId) {
      const tradeAgreement = await this.prisma.tradeAgreement.findFirst({
        where: { id: body.tradeAgreementId, tenantId, isDeleted: false },
      });
      if (!tradeAgreement) {
        throw new NotFoundException('Trade agreement not found');
      }
    }

    const dutyAmount = body.value * (body.dutyRate || 0);
    const taxAmount = body.value * (body.taxRate || 0);

    const line = await this.prisma.customsEntryLine.create({
      data: {
        customsEntryId: id,
        lineNumber: body.lineNumber,
        tariffCodeId: body.tariffCodeId,
        description: body.description,
        quantity: new Prisma.Decimal(body.quantity),
        unit: body.unit,
        weight: body.weight ? new Prisma.Decimal(body.weight) : null,
        value: new Prisma.Decimal(body.value),
        originCountry: body.originCountry,
        dutyRate: body.dutyRate ? new Prisma.Decimal(body.dutyRate) : new Prisma.Decimal(0),
        dutyAmount: new Prisma.Decimal(dutyAmount),
        taxRate: body.taxRate ? new Prisma.Decimal(body.taxRate) : new Prisma.Decimal(0),
        taxAmount: new Prisma.Decimal(taxAmount),
        preferentialRate: body.preferentialRate || false,
        tradeAgreementId: body.tradeAgreementId,
        isHazardous: body.isHazardous || false,
        unNumber: body.unNumber,
        imdgClass: body.imdgClass,
        packingGroup: body.packingGroup,
      },
      include: { tariffCode: true },
    });

    await this.recalculateTotals(tenantId, id);

    return line;
  }

  async removeLine(tenantId: string, id: string, lineId: string, userId: string): Promise<void> {
    const entry = await this.findById(tenantId, id);

    if (entry.status !== CustomsStatus.NOT_STARTED && entry.status !== CustomsStatus.DOCUMENTS_PREPARING) {
      throw new BadRequestException('Can only remove lines from entries in preparation');
    }

    const line = await this.prisma.customsEntryLine.findFirst({
      where: { id: lineId, customsEntryId: id },
    });

    if (!line) {
      throw new NotFoundException('Line not found');
    }

    await this.prisma.customsEntryLine.delete({ where: { id: lineId } });

    await this.recalculateTotals(tenantId, id);
  }

  private async recalculateTotals(tenantId: string, id: string): Promise<void> {
    const lines = await this.prisma.customsEntryLine.findMany({
      where: { customsEntryId: id },
    });

    const totalDuty = lines.reduce((sum, line) => sum.add(line.dutyAmount), new Prisma.Decimal(0));
    const totalTax = lines.reduce((sum, line) => sum.add(line.taxAmount), new Prisma.Decimal(0));
    const totalFees = await this.prisma.customsFee.aggregate({
      where: { customsEntryId: id },
      _sum: { amount: true },
    });

    const totalPayable = totalDuty.add(totalTax).add(totalFees._sum.amount || new Prisma.Decimal(0));

    await this.prisma.customsEntry.update({
      where: { id },
      data: {
        totalDuty,
        totalTax,
        totalFees: totalFees._sum.amount || new Prisma.Decimal(0),
        totalPayable,
        balanceAmount: totalPayable.sub(new Prisma.Decimal(0)), // paidAmount would be tracked separately
      },
    });
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.CustomsEntryWhereInput = { tenantId, isDeleted: false };
    if (branchId) where.branchId = branchId;

    const [total, byStatus, byType, clearedThisMonth, totalDutyCollected] = await Promise.all([
      this.prisma.customsEntry.count({ where }),
      this.prisma.customsEntry.groupBy({ by: ['status'], where, _count: { status: true } }),
      this.prisma.customsEntry.groupBy({ by: ['type'], where, _count: { type: true } }),
      this.prisma.customsEntry.count({
        where: {
          ...where,
          status: CustomsStatus.CLEARED,
          clearanceDate: { gte: new Date(new Date().setDate(1)) },
        },
      }),
      this.prisma.customsEntry.aggregate({
        where,
        _sum: { totalDuty: true, totalTax: true, totalFees: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item._count.status }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.type }), {}),
      clearedThisMonth,
      totalDutyCollected: totalDutyCollected._sum.totalDuty?.toNumber() || 0,
      totalTaxCollected: totalDutyCollected._sum.totalTax?.toNumber() || 0,
      totalFeesCollected: totalDutyCollected._sum.totalFees?.toNumber() || 0,
    };
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'CUSTOMS_ENTRY',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish customs entry event:', error);
    }
  }

  private mapToResponse(entry: CustomsEntry & {
    lines?: any[];
    documents?: any[];
    inspections?: any[];
    fees?: any[];
    customer?: any;
    supplier?: any;
    broker?: any;
    carrier?: any;
    vessel?: any;
    voyage?: any;
    container?: any;
  }): CustomsEntryResponseDto {
    return {
      id: entry.id,
      code: entry.code,
      reference: entry.reference,
      type: entry.type,
      status: entry.status,
      entryNumber: entry.entryNumber,
      shipmentId: entry.shipmentId,
      jobId: entry.jobId,
      bookingId: entry.bookingId,
      customerId: entry.customerId,
      supplierId: entry.supplierId,
      brokerId: entry.brokerId,
      carrierId: entry.carrierId,
      vesselId: entry.vesselId,
      voyageId: entry.voyageId,
      containerId: entry.containerId,
      originCountry: entry.originCountry,
      destinationCountry: entry.destinationCountry,
      portOfEntry: entry.portOfEntry,
      portOfExit: entry.portOfExit,
      incoterm: entry.incoterm,
      currency: entry.currency,
      exchangeRate: entry.exchangeRate.toNumber(),
      totalValue: entry.totalValue.toNumber(),
      totalDuty: entry.totalDuty.toNumber(),
      totalTax: entry.totalTax.toNumber(),
      totalFees: entry.totalFees.toNumber(),
      totalPayable: entry.totalPayable.toNumber(),
      paidAmount: entry.paidAmount.toNumber(),
      balanceAmount: entry.balanceAmount.toNumber(),
      filingDate: entry.filingDate,
      acceptanceDate: entry.acceptanceDate,
      clearanceDate: entry.clearanceDate,
      releaseDate: entry.releaseDate,
      examDate: entry.examDate,
      examType: entry.examType,
      examResult: entry.examResult,
      holdReason: entry.holdReason,
      notes: entry.notes,
      internalNotes: entry.internalNotes,
      lines: entry.lines?.map(line => ({
        id: line.id,
        lineNumber: line.lineNumber,
        tariffCodeId: line.tariffCodeId,
        description: line.description,
        quantity: line.quantity.toNumber(),
        unit: line.unit,
        weight: line.weight?.toNumber(),
        value: line.value.toNumber(),
        originCountry: line.originCountry,
        dutyRate: line.dutyRate.toNumber(),
        dutyAmount: line.dutyAmount.toNumber(),
        taxRate: line.taxRate.toNumber(),
        taxAmount: line.taxAmount.toNumber(),
        feeAmount: line.feeAmount.toNumber(),
        preferentialRate: line.preferentialRate,
        tradeAgreementId: line.tradeAgreementId,
        isHazardous: line.isHazardous,
        unNumber: line.unNumber,
        imdgClass: line.imdgClass,
        packingGroup: line.packingGroup,
        metadata: line.metadata,
        createdAt: line.createdAt,
        updatedAt: line.updatedAt,
      })),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}