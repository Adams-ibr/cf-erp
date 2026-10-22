import { IsString, IsOptional, IsEnum, IsEmail, IsUrl, IsNumber, Min, Max, IsUUID, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum CustomerType {
  COMPANY = 'COMPANY',
  INDIVIDUAL = 'INDIVIDUAL',
  GOVERNMENT = 'GOVERNMENT',
  NGO = 'NGO',
  OTHER = 'OTHER',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT',
  LEAD = 'LEAD',
  ON_HOLD = 'ON_HOLD',
  BLOCKED = 'BLOCKED',
  ARCHIVED = 'ARCHIVED',
}

export enum RiskRating {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'CUST-001' })
  @IsString()
  @Min(1)
  @Max(50)
  code: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @Min(1)
  @Max(200)
  name: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  @Max(200)
  tradeName?: string;

  @ApiPropertyOptional({ enum: CustomerType, example: CustomerType.COMPANY })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ enum: CustomerStatus, example: CustomerStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @Max(50)
  taxId?: string;

  @ApiPropertyOptional({ example: 'VAT123456' })
  @IsOptional()
  @IsString()
  @Max(50)
  vatNumber?: string;

  @ApiPropertyOptional({ example: 'REG123456' })
  @IsOptional()
  @IsString()
  @Max(50)
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Logistics' })
  @IsOptional()
  @IsString()
  @Max(100)
  industry?: string;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualRevenue?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  employeeCount?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ enum: RiskRating, example: RiskRating.LOW })
  @IsOptional()
  @IsEnum(RiskRating)
  riskRating?: RiskRating;

  @ApiPropertyOptional({ example: 'Key account' })
  @IsOptional()
  @IsString()
  @Max(1000)
  notes?: string;

  @ApiPropertyOptional({ example: 'branch-id' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'parent-customer-id' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ type: () => [CreateContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts?: CreateContactDto[];

  @ApiPropertyOptional({ type: () => [CreateAddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses?: CreateAddressDto[];

  @ApiPropertyOptional({ type: () => [CreateBankDetailDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBankDetailDto)
  bankDetails?: CreateBankDetailDto[];
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  @Min(1)
  @Max(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  @Max(200)
  tradeName?: string;

  @ApiPropertyOptional({ enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @Max(50)
  taxId?: string;

  @ApiPropertyOptional({ example: 'VAT123456' })
  @IsOptional()
  @IsString()
  @Max(50)
  vatNumber?: string;

  @ApiPropertyOptional({ example: 'REG123456' })
  @IsOptional()
  @IsString()
  @Max(50)
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Logistics' })
  @IsOptional()
  @IsString()
  @Max(100)
  industry?: string;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualRevenue?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  employeeCount?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ enum: RiskRating })
  @IsOptional()
  @IsEnum(RiskRating)
  riskRating?: RiskRating;

  @ApiPropertyOptional({ example: 'Key account' })
  @IsOptional()
  @IsString()
  @Max(1000)
  notes?: string;

  @ApiPropertyOptional({ example: 'branch-id' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'parent-customer-id' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class CustomerQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ enum: RiskRating })
  @IsOptional()
  @IsEnum(RiskRating)
  riskRating?: RiskRating;

  @ApiPropertyOptional({ example: 'branch-id' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'Acme' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CustomerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  tradeName?: string;

  @ApiProperty({ enum: CustomerType })
  type: CustomerType;

  @ApiProperty({ enum: CustomerStatus })
  status: CustomerStatus;

  @ApiPropertyOptional()
  taxId?: string;

  @ApiPropertyOptional()
  vatNumber?: string;

  @ApiPropertyOptional()
  registrationNumber?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  industry?: string;

  @ApiPropertyOptional()
  annualRevenue?: number;

  @ApiPropertyOptional()
  employeeCount?: number;

  @ApiProperty()
  creditLimit: number;

  @ApiProperty()
  paymentTerms: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: RiskRating })
  riskRating: RiskRating;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  tenantId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiPropertyOptional()
  assignedToId?: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiPropertyOptional({ type: () => ContactResponseDto, isArray: true })
  contacts?: ContactResponseDto[];

  @ApiPropertyOptional({ type: () => AddressResponseDto, isArray: true })
  addresses?: AddressResponseDto[];

  @ApiPropertyOptional({ type: () => BankDetailResponseDto, isArray: true })
  bankDetails?: BankDetailResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateContactDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @Min(1)
  @Max(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Min(1)
  @Max(50)
  lastName: string;

  @ApiPropertyOptional({ example: 'Logistics Manager' })
  @IsOptional()
  @IsString()
  @Max(100)
  title?: string;

  @ApiPropertyOptional({ example: 'Operations' })
  @IsOptional()
  @IsString()
  @Max(100)
  department?: string;

  @ApiPropertyOptional({ example: 'john.doe@acme.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @Max(20)
  phone?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @Max(20)
  mobile?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @Max(20)
  fax?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateAddressDto {
  @ApiProperty({ enum: ['BILLING', 'SHIPPING', 'REGISTERED', 'WAREHOUSE', 'PICKUP', 'DELIVERY', 'OTHER'], example: 'BILLING' })
  @IsEnum(['BILLING', 'SHIPPING', 'REGISTERED', 'WAREHOUSE', 'PICKUP', 'DELIVERY', 'OTHER'])
  type: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @Min(1)
  @Max(200)
  line1: string;

  @ApiPropertyOptional({ example: 'Suite 100' })
  @IsOptional()
  @IsString()
  @Max(200)
  line2?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @Min(1)
  @Max(100)
  city: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  @Max(100)
  state?: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @Min(1)
  @Max(20)
  postalCode: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @Min(2)
  @Max(2)
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  coordinates?: { latitude: number; longitude: number };

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateBankDetailDto {
  @ApiProperty({ example: 'Bank of America' })
  @IsString()
  @Min(1)
  @Max(100)
  bankName: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @Min(1)
  @Max(100)
  accountName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @Min(1)
  @Max(50)
  accountNumber: string;

  @ApiPropertyOptional({ example: 'US123456789' })
  @IsOptional()
  @IsString()
  @Max(50)
  iban?: string;

  @ApiPropertyOptional({ example: 'BOFAUS3N' })
  @IsOptional()
  @IsString()
  @Max(20)
  swiftBic?: string;

  @ApiPropertyOptional({ example: '021000021' })
  @IsOptional()
  @IsString()
  @Max(20)
  routingNumber?: string;

  @ApiPropertyOptional({ example: 'Main Branch' })
  @IsOptional()
  @IsString()
  @Max(100)
  branchName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  branchAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  mobile?: string;

  @ApiPropertyOptional()
  fax?: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  line1: string;

  @ApiPropertyOptional()
  line2?: string;

  @ApiProperty()
  city: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;

  @ApiPropertyOptional()
  coordinates?: { latitude: number; longitude: number };

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BankDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  accountName: string;

  @ApiProperty()
  accountNumber: string;

  @ApiPropertyOptional()
  iban?: string;

  @ApiPropertyOptional()
  swiftBic?: string;

  @ApiPropertyOptional()
  routingNumber?: string;

  @ApiPropertyOptional()
  branchName?: string;

  @ApiPropertyOptional()
  branchAddress?: Record<string, unknown>;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}