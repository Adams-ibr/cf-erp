import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, BankDetail, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateBankDetailDto, UpdateBankDetailDto, BankDetailQueryDto, BankDetailResponseDto } from './dto/bank-detail.dto';
import { PaginatedResult } from '@cf-erp/shared';

@Injectable()
export class BankDetailsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createBankDetailDto: CreateBankDetailDto,
  ): Promise<BankDetailResponseDto> {
    if (!createBankDetailDto.customerId && !createBankDetailDto.supplierId) {
      throw new BadRequestException('Bank detail must belong to either a customer or supplier');
    }

    if (createBankDetailDto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: createBankDetailDto.customerId, tenantId, isDeleted: false },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (createBankDetailDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createBankDetailDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    if (createBankDetailDto.isDefault) {
      await this.unsetDefault(tenantId, createBankDetailDto.customerId, createBankDetailDto.supplierId);
    }

    const bankDetail = await this.prisma.bankDetail.create({
      data: {
        ...createBankDetailDto,
        tenantId,
        isActive: createBankDetailDto.isActive ?? true,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return this.mapToResponse(bankDetail);
  }

  async findAll(tenantId: string, query: BankDetailQueryDto): Promise<PaginatedResult<BankDetailResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BankDetailWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.currency) {
      where.currency = query.currency;
    }

    if (query.isDefault !== undefined) {
      where.isDefault = query.isDefault;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [bankDetails, total] = await Promise.all([
      this.prisma.bankDetail.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.bankDetail.count({ where }),
    ]);

    return {
      data: bankDetails.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<BankDetailResponseDto> {
    const bankDetail = await this.prisma.bankDetail.findFirst({
      where: { id, tenantId, isDeleted: false },
    });

    if (!bankDetail) {
      throw new NotFoundException('Bank detail not found');
    }

    return this.mapToResponse(bankDetail);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateBankDetailDto: UpdateBankDetailDto,
  ): Promise<BankDetailResponseDto> {
    const bankDetail = await this.findById(tenantId, id);

    if (updateBankDetailDto.isDefault && !bankDetail.isDefault) {
      await this.unsetDefault(tenantId, bankDetail.customerId, bankDetail.supplierId);
    }

    const updatedBankDetail = await this.prisma.bankDetail.update({
      where: { id },
      data: {
        ...updateBankDetailDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedBankDetail);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.bankDetail.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async setDefault(tenantId: string, id: string, userId: string): Promise<BankDetailResponseDto> {
    const bankDetail = await this.findById(tenantId, id);

    await this.unsetDefault(tenantId, bankDetail.customerId, bankDetail.supplierId);

    const updatedBankDetail = await this.prisma.bankDetail.update({
      where: { id },
      data: {
        isDefault: true,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedBankDetail);
  }

  private async unsetDefault(
    tenantId: string,
    customerId: string | null,
    supplierId: string | null,
  ): Promise<void> {
    const where: Prisma.BankDetailWhereInput = {
      tenantId,
      isDeleted: false,
      isDefault: true,
    };

    if (customerId) {
      where.customerId = customerId;
    } else if (supplierId) {
      where.supplierId = supplierId;
    }

    await this.prisma.bankDetail.updateMany({
      where,
      data: { isDefault: false },
    });
  }

  private mapToResponse(bankDetail: BankDetail): BankDetailResponseDto {
    return {
      id: bankDetail.id,
      bankName: bankDetail.bankName,
      accountName: bankDetail.accountName,
      accountNumber: bankDetail.accountNumber,
      iban: bankDetail.iban,
      swiftBic: bankDetail.swiftBic,
      routingNumber: bankDetail.routingNumber,
      branchName: bankDetail.branchName,
      branchAddress: bankDetail.branchAddress as Record<string, unknown> | undefined,
      currency: bankDetail.currency,
      isDefault: bankDetail.isDefault,
      isActive: bankDetail.isActive,
      customerId: bankDetail.customerId,
      supplierId: bankDetail.supplierId,
      createdAt: bankDetail.createdAt,
      updatedAt: bankDetail.updatedAt,
    };
  }
}