import { IsString, IsOptional, IsEnum, IsEmail, IsUrl, IsNumber, Min, Max, IsUUID, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum SupplierType {
  COMPANY = 'COMPANY',
  INDIVIDUAL = 'INDIVIDUAL',
  AGENT = 'AGENT',
  CARRIER = 'CARRIER',
  CUSTOMS_BROKER = 'CUSTOMS_BROKER',
  WAREHOUSE = 'WAREHOUSE',
  INSURANCE = 'INSURANCE',
  BANK = 'BANK',
  GOVERNMENT = 'GOVERNMENT',
  OTHER = 'OTHER',
}

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT',
  ON_HOLD = 'ON_HOLD',
  BLOCKED = 'BLOCKED',
  ARCHIVED = 'ARCHIVED',
}

export enum Incoterm {
  EXW = 'EXW',
  FCA = 'FCA',
  CPT = 'CPT',
  CIP = 'CIP',
  DAP = 'DAP',
  DPU = 'DPU',
  DDP = 'DDP',
  FAS = 'FAS',
  FOB = 'FOB',
  CFR = 'CFR',
  CIF = 'CIF',
}

export enum RiskRating {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'SUP-001' })
  @IsString()
  @Min(1)
  @Max(50)
  code: string;

  @ApiProperty({ example: 'Global Shipping Co' })
  @IsString()
  @Min(1)
  @Max(200)
  name: string;

  @ApiPropertyOptional({ example: 'Global Shipping' })
  @IsOptional()
  @IsString()
  @Max(200)
  tradeName?: string;

  @ApiPropertyOptional({ enum: SupplierType, example: SupplierType.COMPANY })
  @IsOptional()
  @IsEnum(SupplierType)
  type?: SupplierType;

  @ApiPropertyOptional({ enum: SupplierStatus, example: SupplierStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

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

  @ApiPropertyOptional({ example: 'https://globalshipping.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Shipping' })
  @IsOptional()
  @IsString()
  @Max(100)
  industry?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @ApiPropertyOptional({ enum: Incoterm, example: Incoterm.FOB })
  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @Max(100)
  portOfLoading?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @Max(100)
  portOfDischarge?: string;

  @ApiPropertyOptional({ enum: RiskRating, example: RiskRating.LOW })
  @IsOptional()
  @IsEnum(RiskRating)
  riskRating?: RiskRating;

  @ApiPropertyOptional({ type: [String], example: ['ISO 9001', 'AEO'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ example: 'Preferred carrier' })
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

  @ApiPropertyOptional({ example: 'parent-supplier-id' })
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

export class UpdateSupplierDto {
  @ApiPropertyOptional({ example: 'Global Shipping Co' })
  @IsOptional()
  @IsString()
  @Min(1)
  @Max(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Global Shipping' })
  @IsOptional()
  @IsString()
  @Max(200)
  tradeName?: string;

  @ApiPropertyOptional({ enum: SupplierType })
  @IsOptional()
  @IsEnum(SupplierType)
  type?: SupplierType;

  @ApiPropertyOptional({ enum: SupplierStatus })
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

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

  @ApiPropertyOptional({ example: 'https://globalshipping.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Shipping' })
  @IsOptional()
  @IsString()
  @Max(100)
  industry?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @ApiPropertyOptional({ enum: Incoterm })
  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @Max(100)
  portOfLoading?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @Max(100)
  portOfDischarge?: string;

  @ApiPropertyOptional({ enum: RiskRating })
  @IsOptional()
  @IsEnum(RiskRating)
  riskRating?: RiskRating;

  @ApiPropertyOptional({ type: [String], example: ['ISO 9001', 'AEO'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ example: 'Preferred carrier' })
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

  @ApiPropertyOptional({ example: 'parent-supplier-id' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class SupplierQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SupplierStatus })
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @ApiPropertyOptional({ enum: SupplierType })
  @IsOptional()
  @IsEnum(SupplierType)
  type?: SupplierType;

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

  @ApiPropertyOptional({ example: 'Global' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class SupplierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  tradeName?: string;

  @ApiProperty({ enum: SupplierType })
  type: SupplierType;

  @ApiProperty({ enum: SupplierStatus })
  status: SupplierStatus;

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

  @ApiProperty()
  currency: string;

  @ApiProperty()
  paymentTerms: number;

  @ApiProperty({ enum: Incoterm })
  incoterm: Incoterm;

  @ApiPropertyOptional()
  portOfLoading?: string;

  @ApiPropertyOptional()
  portOfDischarge?: string;

  @ApiProperty({ enum: RiskRating })
  riskRating: RiskRating;

  @ApiProperty({ type: [String] })
  certifications: string[];

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
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @Min(1)
  @Max(50)
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @Min(1)
  @Max(50)
  lastName: string;

  @ApiPropertyOptional({ example: 'Account Manager' })
  @IsOptional()
  @IsString()
  @Max(100)
  title?: string;

  @ApiPropertyOptional({ example: 'Sales' })
  @IsOptional()
  @IsString()
  @Max(100)
  department?: string;

  @ApiPropertyOptional({ example: 'jane.smith@globalshipping.com' })
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

  @ApiProperty({ example: '456 Port Avenue' })
  @IsString()
  @Min(1)
  @Max(200)
  line1: string;

  @ApiPropertyOptional({ example: 'Building B' })
  @IsOptional()
  @IsString()
  @Max(200)
  line2?: string;

  @ApiProperty({ example: 'Shanghai' })
  @IsString()
  @Min(1)
  @Max(100)
  city: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @Max(100)
  state?: string;

  @ApiProperty({ example: '200000' })
  @IsString()
  @Min(1)
  @Max(20)
  postalCode: string;

  @ApiProperty({ example: 'CN' })
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
  @ApiProperty({ example: 'Bank of China' })
  @IsString()
  @Min(1)
  @Max(100)
  bankName: string;

  @ApiProperty({ example: 'Global Shipping Co' })
  @IsString()
  @Min(1)
  @Max(100)
  accountName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Min(1)
  @Max(50)
  accountNumber: string;

  @ApiPropertyOptional({ example: 'CN123456789' })
  @IsOptional()
  @IsString()
  @Max(50)
  iban?: string;

  @ApiPropertyOptional({ example: 'BKCHCNBJ' })
  @IsOptional()
  @IsString()
  @Max(20)
  swiftBic?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @Max(20)
  routingNumber?: string;

  @ApiPropertyOptional({ example: 'Shanghai Branch' })
  @IsOptional()
  @IsString()
  @Max(100)
  branchName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  branchAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'CNY' })
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