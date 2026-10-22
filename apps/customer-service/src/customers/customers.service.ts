import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Customer, CustomerStatus, CustomerType, RiskRating, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, CustomerResponseDto, CreateContactDto, CreateAddressDto, CreateBankDetailDto } from './dto/customer.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient, EventTypes } from '@cf-erp/messaging';

@Injectable()
export class CustomersService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { code_tenantId: { code: createCustomerDto.code, tenantId } },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer code already exists in this tenant');
    }

    if (createCustomerDto.taxId) {
      const existingTaxId = await this.prisma.customer.findFirst({
        where: { taxId: createCustomerDto.taxId, tenantId, isDeleted: false, NOT: { code: createCustomerDto.code } },
      });
      if (existingTaxId) {
        throw new ConflictException('Tax ID already exists');
      }
    }

    if (createCustomerDto.vatNumber) {
      const existingVat = await this.prisma.customer.findFirst({
        where: { vatNumber: createCustomerDto.vatNumber, tenantId, isDeleted: false, NOT: { code: createCustomerDto.code } },
      });
      if (existingVat) {
        throw new ConflictException('VAT number already exists');
      }
    }

    if (createCustomerDto.parentId) {
      const parent = await this.prisma.customer.findFirst({
        where: { id: createCustomerDto.parentId, tenantId, isDeleted: false },
      });
      if (!parent) {
        throw new NotFoundException('Parent customer not found');
      }
    }

    if (createCustomerDto.assignedToId) {
      const assignee = await this.prisma.user.findFirst({
        where: { id: createCustomerDto.assignedToId, tenantId, isActive: true },
      });
      if (!assignee) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const customer = await this.prisma.$transaction(async (tx) => {
      const newCustomer = await tx.customer.create({
        data: {
          code: createCustomerDto.code,
          name: createCustomerDto.name,
          tradeName: createCustomerDto.tradeName,
          type: createCustomerDto.type || CustomerType.COMPANY,
          status: createCustomerDto.status || CustomerStatus.ACTIVE,
          taxId: createCustomerDto.taxId,
          vatNumber: createCustomerDto.vatNumber,
          registrationNumber: createCustomerDto.registrationNumber,
          website: createCustomerDto.website,
          industry: createCustomerDto.industry,
          annualRevenue: createCustomerDto.annualRevenue ? new Prisma.Decimal(createCustomerDto.annualRevenue) : null,
          employeeCount: createCustomerDto.employeeCount,
          creditLimit: createCustomerDto.creditLimit ? new Prisma.Decimal(createCustomerDto.creditLimit) : new Prisma.Decimal(0),
          paymentTerms: createCustomerDto.paymentTerms || 30,
          currency: createCustomerDto.currency || 'USD',
          riskRating: createCustomerDto.riskRating || RiskRating.LOW,
          notes: createCustomerDto.notes,
          tenantId,
          branchId: createCustomerDto.branchId || branchId,
          assignedToId: createCustomerDto.assignedToId,
          parentId: createCustomerDto.parentId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (createCustomerDto.contacts && createCustomerDto.contacts.length > 0) {
        await tx.contact.createMany({
          data: createCustomerDto.contacts.map((contact, index) => ({
            ...contact,
            customerId: newCustomer.id,
            tenantId,
            isPrimary: index === 0 || contact.isPrimary,
            createdBy: userId,
            updatedBy: userId,
          })),
        });
      }

      if (createCustomerDto.addresses && createCustomerDto.addresses.length > 0) {
        await tx.address.createMany({
          data: createCustomerDto.addresses.map((address, index) => ({
            ...address,
            customerId: newCustomer.id,
            tenantId,
            isDefault: index === 0 || address.isDefault,
            createdBy: userId,
            updatedBy: userId,
          })),
        });
      }

      if (createCustomerDto.bankDetails && createCustomerDto.bankDetails.length > 0) {
        await tx.bankDetail.createMany({
          data: createCustomerDto.bankDetails.map((detail, index) => ({
            ...detail,
            customerId: newCustomer.id,
            tenantId,
            isDefault: index === 0 || detail.isDefault,
            createdBy: userId,
            updatedBy: userId,
          })),
        });
      }

      await tx.activity.create({
        data: {
          type: 'NOTE',
          subject: 'Customer Created',
          description: `Customer ${newCustomer.name} (${newCustomer.code}) created`,
          customerId: newCustomer.id,
          userId,
          tenantId,
        },
      });

      return newCustomer;
    });

    await this.publishEvent(EventTypes.CUSTOMER.CREATED, customer);

    return this.mapToResponse(customer);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: CustomerQueryDto,
  ): Promise<PaginatedResult<CustomerResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.status) {
      where.status = query.status as CustomerStatus;
    }

    if (query.type) {
      where.type = query.type as CustomerType;
    }

    if (query.riskRating) {
      where.riskRating = query.riskRating as RiskRating;
    }

    if (query.assignedToId) {
      where.assignedToId = query.assignedToId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { tradeName: { contains: query.search, mode: 'insensitive' } },
        { taxId: { contains: query.search, mode: 'insensitive' } },
        { vatNumber: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          contacts: { where: { isDeleted: false } },
          addresses: { where: { isDeleted: false } },
          bankDetails: { where: { isDeleted: false } },
          _count: { select: { shipments: true, invoices: true, quotations: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        contacts: { where: { isDeleted: false } },
        addresses: { where: { isDeleted: false } },
        bankDetails: { where: { isDeleted: false } },
        assignedTo: true,
        parent: true,
        children: { where: { isDeleted: false } },
        _count: { select: { shipments: true, invoices: true, quotations: true, contacts: true, addresses: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.mapToResponse(customer);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.findById(tenantId, id);

    if (updateCustomerDto.taxId && updateCustomerDto.taxId !== customer.taxId) {
      const existingTaxId = await this.prisma.customer.findFirst({
        where: { taxId: updateCustomerDto.taxId, tenantId, isDeleted: false, NOT: { id } },
      });
      if (existingTaxId) {
        throw new ConflictException('Tax ID already exists');
      }
    }

    if (updateCustomerDto.vatNumber && updateCustomerDto.vatNumber !== customer.vatNumber) {
      const existingVat = await this.prisma.customer.findFirst({
        where: { vatNumber: updateCustomerDto.vatNumber, tenantId, isDeleted: false, NOT: { id } },
      });
      if (existingVat) {
        throw new ConflictException('VAT number already exists');
      }
    }

    if (updateCustomerDto.parentId) {
      if (updateCustomerDto.parentId === id) {
        throw new BadRequestException('Customer cannot be its own parent');
      }
      const parent = await this.prisma.customer.findFirst({
        where: { id: updateCustomerDto.parentId, tenantId, isDeleted: false },
      });
      if (!parent) {
        throw new NotFoundException('Parent customer not found');
      }
    }

    if (updateCustomerDto.assignedToId) {
      const assignee = await this.prisma.user.findFirst({
        where: { id: updateCustomerDto.assignedToId, tenantId, isActive: true },
      });
      if (!assignee) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...updateCustomerDto,
        annualRevenue: updateCustomerDto.annualRevenue ? new Prisma.Decimal(updateCustomerDto.annualRevenue) : undefined,
        creditLimit: updateCustomerDto.creditLimit ? new Prisma.Decimal(updateCustomerDto.creditLimit) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        contacts: { where: { isDeleted: false } },
        addresses: { where: { isDeleted: false } },
        bankDetails: { where: { isDeleted: false } },
      },
    });

    await this.publishEvent(EventTypes.CUSTOMER.UPDATED, updatedCustomer);

    return this.mapToResponse(updatedCustomer);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    await this.findById(tenantId, id);

    await this.prisma.customer.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent(EventTypes.CUSTOMER.DELETED, { id, tenantId });
  }

  async updateStatus(tenantId: string, id: string, userId: string, status: string): Promise<CustomerResponseDto> {
    const customer = await this.findById(tenantId, id);

    const validStatuses = Object.values(CustomerStatus);
    if (!validStatuses.includes(status as CustomerStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        status: status as CustomerStatus,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        contacts: { where: { isDeleted: false } },
        addresses: { where: { isDeleted: false } },
        bankDetails: { where: { isDeleted: false } },
      },
    });

    await this.publishEvent(EventTypes.CUSTOMER.STATUS_CHANGED, {
      ...updatedCustomer,
      previousStatus: customer.status,
    });

    return this.mapToResponse(updatedCustomer);
  }

  async assign(tenantId: string, id: string, userId: string, assignedToId: string): Promise<CustomerResponseDto> {
    const customer = await this.findById(tenantId, id);

    const assignee = await this.prisma.user.findFirst({
      where: { id: assignedToId, tenantId, isActive: true },
    });
    if (!assignee) {
      throw new NotFoundException('Assigned user not found');
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        assignedToId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        contacts: { where: { isDeleted: false } },
        addresses: { where: { isDeleted: false } },
        bankDetails: { where: { isDeleted: false } },
      },
    });

    return this.mapToResponse(updatedCustomer);
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.CustomerWhereInput = { tenantId, isDeleted: false };
    if (branchId) where.branchId = branchId;

    const [total, active, inactive, prospect, byType, byRisk, totalRevenue] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.count({ where: { ...where, status: CustomerStatus.ACTIVE } }),
      this.prisma.customer.count({ where: { ...where, status: CustomerStatus.INACTIVE } }),
      this.prisma.customer.count({ where: { ...where, status: CustomerStatus.PROSPECT } }),
      this.prisma.customer.groupBy({ by: ['type'], where, _count: { type: true } }),
      this.prisma.customer.groupBy({ by: ['riskRating'], where, _count: { riskRating: true } }),
      this.prisma.customer.aggregate({ where, _sum: { annualRevenue: true } }),
    ]);

    return {
      total,
      active,
      inactive,
      prospect,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.type }), {}),
      byRisk: byRisk.reduce((acc, item) => ({ ...acc, [item.riskRating]: item._count.riskRating }), {}),
      totalRevenue: totalRevenue._sum.annualRevenue?.toNumber() || 0,
    };
  }

  async getActivities(tenantId: string, customerId: string, page = 1, limit = 20): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const where = { customerId, tenantId };

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      data: activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addActivity(
    tenantId: string,
    customerId: string,
    userId: string,
    body: { type: string; subject: string; description?: string; metadata?: Record<string, unknown> },
  ): Promise<any> {
    await this.findById(tenantId, customerId);

    return this.prisma.activity.create({
      data: {
        type: body.type as any,
        subject: body.subject,
        description: body.description,
        metadata: body.metadata,
        customerId,
        userId,
        tenantId,
      },
    });
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'CUSTOMER',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish customer event:', error);
    }
  }

  private mapToResponse(customer: Customer & {
    contacts?: any[];
    addresses?: any[];
    bankDetails?: any[];
    assignedTo?: any;
    parent?: any;
    children?: any[];
    _count?: any;
  }): CustomerResponseDto {
    return {
      id: customer.id,
      code: customer.code,
      name: customer.name,
      tradeName: customer.tradeName,
      type: customer.type,
      status: customer.status,
      taxId: customer.taxId,
      vatNumber: customer.vatNumber,
      registrationNumber: customer.registrationNumber,
      website: customer.website,
      industry: customer.industry,
      annualRevenue: customer.annualRevenue?.toNumber(),
      employeeCount: customer.employeeCount,
      creditLimit: customer.creditLimit.toNumber(),
      paymentTerms: customer.paymentTerms,
      currency: customer.currency,
      riskRating: customer.riskRating,
      notes: customer.notes,
      tenantId: customer.tenantId,
      branchId: customer.branchId,
      assignedToId: customer.assignedToId,
      parentId: customer.parentId,
      contacts: customer.contacts?.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        title: c.title,
        department: c.department,
        email: c.email,
        phone: c.phone,
        mobile: c.mobile,
        fax: c.fax,
        isPrimary: c.isPrimary,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      addresses: customer.addresses?.map(a => ({
        id: a.id,
        type: a.type,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.country,
        coordinates: a.coordinates,
        isDefault: a.isDefault,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      bankDetails: customer.bankDetails?.map(b => ({
        id: b.id,
        bankName: b.bankName,
        accountName: b.accountName,
        accountNumber: b.accountNumber,
        iban: b.iban,
        swiftBic: b.swiftBic,
        routingNumber: b.routingNumber,
        branchName: b.branchName,
        branchAddress: b.branchAddress,
        currency: b.currency,
        isDefault: b.isDefault,
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}