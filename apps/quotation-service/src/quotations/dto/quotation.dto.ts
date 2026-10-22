import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, ValidateNested, IsArray, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REVISED = 'REVISED',
  CONVERTED = 'CONVERTED',
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

export class CreateQuotationDto {
  @ApiProperty({ example: 'QUO-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'customer-id' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  validFrom: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
  @Type(() => Date)
  @IsDate()
  validUntil: Date;

  @ApiPropertyOptional({ enum: Incoterm, example: Incoterm.FOB })
  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm;

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

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  exchangeRate?: number;

  @ApiPropertyOptional({ example: 'Standard terms apply' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: 'Payment within 30 days' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  terms?: string;

  @ApiPropertyOptional({ type: () => [CreateQuotationItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items?: CreateQuotationItemDto[];
}

export class UpdateQuotationDto {
  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date;

  @ApiPropertyOptional({ enum: Incoterm })
  @IsOptional()
  @IsEnum(Incoterm)
  incoterm?: Incoterm;

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

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  exchangeRate?: number;

  @ApiPropertyOptional({ example: 'Standard terms apply' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: 'Payment within 30 days' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  terms?: string;
}

export class CreateQuotationItemDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ example: 'Ocean Freight - 20ft Container' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ example: 'CONTAINER' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  unit: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ example: 'HS123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  commodityCode?: string;

  @ApiPropertyOptional({ example: 20000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 33 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  origin?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  destination?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class QuotationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validFrom?: Date;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date;

  @ApiPropertyOptional({ example: 'QUO-001' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class QuotationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  version: number;

  @ApiProperty({ enum: QuoteStatus })
  status: QuoteStatus;

  @ApiProperty()
  customerId: string;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiProperty()
  validFrom: Date;

  @ApiProperty()
  validUntil: Date;

  @ApiProperty({ enum: Incoterm })
  incoterm: Incoterm;

  @ApiProperty()
  paymentTerms: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  terms?: string;

  @ApiPropertyOptional()
  approvedBy?: string;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  sentAt?: Date;

  @ApiPropertyOptional()
  viewedAt?: Date;

  @ApiPropertyOptional()
  respondedAt?: Date;

  @ApiPropertyOptional({ type: () => QuotationItemResponseDto, isArray: true })
  items?: QuotationItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class QuotationItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lineNumber: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  discountPercent: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  taxPercent: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiPropertyOptional()
  commodityCode?: string;

  @ApiPropertyOptional()
  weight?: number;

  @ApiPropertyOptional()
  volume?: number;

  @ApiPropertyOptional()
  origin?: string;

  @ApiPropertyOptional()
  destination?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SendQuotationDto {
  @ApiPropertyOptional({ example: ['email1@example.com', 'email2@example.com'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];
}

export class RespondQuotationDto {
  @ApiProperty({ enum: ['ACCEPTED', 'REJECTED'] })
  @IsEnum(['ACCEPTED', 'REJECTED'])
  response: 'ACCEPTED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Price too high' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}