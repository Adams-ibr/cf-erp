import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, IsArray, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum RateCardStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateRateCardDto {
  @ApiProperty({ example: 'RC-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Asia-US West Coast Rate Card' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Standard rates for Asia to US West Coast' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'quotation-id' })
  @IsOptional()
  @IsUUID()
  quotationId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiProperty({ example: 'Shanghai' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  origin: string;

  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  destination: string;

  @ApiPropertyOptional({ example: 'HS123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  commodityCode?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  validFrom: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
  @Type(() => Date)
  @IsDate()
  validUntil: Date;

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

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  markupPercent?: number;
}

export class UpdateRateCardDto {
  @ApiPropertyOptional({ example: 'Asia-US West Coast Rate Card' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Standard rates for Asia to US West Coast' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'quotation-id' })
  @IsOptional()
  @IsUUID()
  quotationId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  origin?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  destination?: string;

  @ApiPropertyOptional({ example: 'HS123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  commodityCode?: string;

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

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  markupPercent?: number;
}

export class AddRateCardItemDto {
  @ApiProperty({ example: 'rate-id' })
  @IsUUID()
  rateId: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  lineNumber: number;

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

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  markupPercent?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isIncluded?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class RateCardQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: RateCardStatus })
  @IsOptional()
  @IsEnum(RateCardStatus)
  status?: RateCardStatus;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({ example: 'quotation-id' })
  @IsOptional()
  @IsUUID()
  quotationId?: string;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: 'RC-001' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class RateCardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  quotationId?: string;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  carrierId?: string;

  @ApiProperty()
  origin: string;

  @ApiProperty()
  destination: string;

  @ApiPropertyOptional()
  commodityCode?: string;

  @ApiProperty()
  validFrom: Date;

  @ApiProperty()
  validUntil: Date;

  @ApiProperty({ enum: RateCardStatus })
  status: RateCardStatus;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  markupPercent: number;

  @ApiProperty()
  totalAmount: number;

  @ApiPropertyOptional({ type: () => RateCardItemResponseDto, isArray: true })
  items?: RateCardItemResponseDto[];

  @ApiPropertyOptional()
  approvedBy?: string;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RateCardItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rateId: string;

  @ApiProperty()
  lineNumber: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  markupPercent: number;

  @ApiProperty()
  markupAmount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  isIncluded: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiPropertyOptional({ type: () => RateResponseDto })
  rate?: RateResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  basis: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  unit: string;

  @ApiPropertyOptional()
  origin?: string;

  @ApiPropertyOptional()
  destination?: string;
}