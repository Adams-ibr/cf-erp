import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, CustomsFee, FeeType, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateFeeDto, FeeQueryDto, FeeResponseDto, PayFeeDto } from './dto/fee.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class FeesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    entryId: string,
    userId: string,
    createFeeDto: CreateFeeDto,
  ): Promise<FeeResponseDto> {
    const entry = await this.prisma.customsEntry.findFirst({
      where: { id: entryId, tenantId, isDeleted: false },
    });
    if (!entry) {
      throw new NotFoundException('Customs entry not found');
    }

    const fee = await this.prisma.customsFee.create({
      data: {
        customsEntryId: entryId,
        type: createFeeDto.type,
        description: createFeeDto.description,
        amount: new Prisma.Decimal(createFeeDto.amount),
        currency: createFeeDto.currency || 'USD',
        isPaid: false,
        dueDate: createFeeDto.dueDate,
        invoiceNumber: createFeeDto.invoiceNumber,
        receiptNumber: createFeeDto.receiptNumber,
        tenantId,
      },
    });

    await this.recalculateEntryTotals(tenantId, entryId);

    await this.publishEvent('customs_fee.added', fee);

    return this.mapToResponse(fee);
  }

  async findAll(
    tenantId: string,
    entryId: string,
    query: FeeQueryDto,
  ): Promise<PaginatedResult<FeeResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomsFeeWhereInput = {
      customsEntryId: entryId,
    };

    if (query.type) {
      where.type = query.type as FeeType;
    }

    if (query.isPaid !== undefined) {
      where.isPaid = query.isPaid;
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [fees, total] = await Promise.all([
      this.prisma.customsFee.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.customsFee.count({ where }),
    ]);

    return {
      data: fees.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, entryId: string, id: string): Promise<FeeResponseDto> {
    const fee = await this.prisma.customsFee.findFirst({
      where: { id, customsEntryId: entryId },
    });

    if (!fee) {
      throw new NotFoundException('Fee not found');
    }

    return this.mapToResponse(fee);
  }

  async pay(
    tenantId: string,
    entryId: string,
    id: string,
    userId: string,
    payFeeDto: PayFeeDto,
  ): Promise<FeeResponseDto> {
    const fee = await this.findById(tenantId, entryId, id);

    if (fee.isPaid) {
      throw new BadRequestException('Fee already paid');
    }

    const updatedFee = await this.prisma.customsFee.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paidBy: userId,
        receiptNumber: payFeeDto.transactionId || fee.receiptNumber,
      },
    });

    await this.recalculateEntryTotals(tenantId, entryId);

    await this.prisma.customsPayment.create({
      data: {
        customsEntryId: entryId,
        amount: fee.amount,
        currency: fee.currency,
        paymentDate: new Date(),
        paymentMethod: payFeeDto.paymentMethod,
        reference: payFeeDto.transactionId,
        transactionId: payFeeDto.transactionId,
        status: PaymentStatus.COMPLETED,
        tenantId,
      },
    });

    await this.checkAllFeesPaid(tenantId, entryId);

    await this.publishEvent('customs_fee.paid', updatedFee);

    return this.mapToResponse(updatedFee);
  }

  async delete(tenantId: string, entryId: string, id: string, userId: string): Promise<void> {
    const fee = await this.findById(tenantId, entryId, id);

    if (fee.isPaid) {
      throw new BadRequestException('Cannot delete paid fee');
    }

    await this.prisma.customsFee.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    await this.recalculateEntryTotals(tenantId, entryId);

    await this.publishEvent('customs_fee.deleted', { id, tenantId });
  }

  private async recalculateEntryTotals(tenantId: string, entryId: string): Promise<void> {
    const fees = await this.prisma.customsFee.findMany({
      where: { customsEntryId: entryId, isDeleted: false },
    });

    const totalFees = fees.reduce((sum, f) => sum.add(f.amount), new Prisma.Decimal(0));
    const paidFees = fees.filter(f => f.isPaid).reduce((sum, f) => sum.add(f.amount), new Prisma.Decimal(0));

    await this.prisma.customsEntry.update({
      where: { id: entryId },
      data: {
        totalFees,
        paidAmount: paidFees,
        balanceAmount: totalFees.sub(paidFees),
      },
    });
  }

  private async checkAllFeesPaid(tenantId: string, entryId: string): Promise<void> {
    const fees = await this.prisma.customsFee.findMany({
      where: { customsEntryId: entryId, isDeleted: false },
    });

    const allPaid = fees.every(f => f.isPaid);

    if (allPaid && fees.length > 0) {
      const entry = await this.prisma.customsEntry.findFirst({ where: { id: entryId } });
      if (entry && entry.status === 'PAYMENT_PENDING') {
        await this.prisma.customsEntry.update({
          where: { id: entryId },
          data: { status: 'PAYMENT_COMPLETED' },
        });
      }
    }
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'CUSTOMS_FEE',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish customs fee event:', error);
    }
  }

  private mapToResponse(fee: CustomsFee): FeeResponseDto {
    return {
      id: fee.id,
      type: fee.type,
      description: fee.description,
      amount: fee.amount.toNumber(),
      currency: fee.currency,
      isPaid: fee.isPaid,
      paidAt: fee.paidAt,
      paidBy: fee.paidBy,
      dueDate: fee.dueDate,
      invoiceNumber: fee.invoiceNumber,
      receiptNumber: fee.receiptNumber,
      createdAt: fee.createdAt,
      updatedAt: fee.updatedAt,
    };
  }
}