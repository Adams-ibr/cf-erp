import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum RateType {
  FREIGHT = 'FREIGHT',
  ORIGIN_CHARGES = 'ORIGIN_CHARGES',
  DESTINATION_CHARGES = 'DESTINATION_CHARGES',
  CUSTOMS_CLEARANCE = 'CUSTOMS_CLEARANCE',
  DOCUMENTATION = 'DOCUMENTATION',
  INSURANCE = 'INSURANCE',
  TRANSPORT = 'TRANSPORT',
  WAREHOUSING = 'WAREHOUSING',
  HANDLING = 'HANDLING',
  OTHER = 'OTHER',
}

export enum RateBasis {
  PER_CONTAINER = 'PER_CONTAINER',
  PER_KG = 'PER_KG',
  PER_CBM = 'PER_CBM',
  PER_PALLET = 'PER_PALLET',
  PER_SHIPMENT = 'PER_SHIPMENT',
  PER_DAY = 'PER_DAY',
  PER_HOUR = 'PER_HOUR',
  PER_KM = 'PER_KM',
  PER_MILE = 'PER_MILE',
  LUMP_SUM = 'LUMP_SUM',
  PERCENTAGE = 'PERCENTAGE',
}

export class CreateRateDto {
  @ApiProperty({ example: 'RATE-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Ocean Freight 20ft' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: RateType, example: RateType.FREIGHT })
  @IsEnum(RateType)
  type: RateType;

  @ApiProperty({ enum: RateBasis, example: RateBasis.PER_CONTAINER })
  @IsEnum(RateBasis)
  basis: RateBasis;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @ApiProperty({ example: 'CONTAINER' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  unit: string;

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

  @ApiPropertyOptional({ example: 'HS123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  commodityCode?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

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

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isSpot?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  surcharges?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  conditions?: Record<string, unknown>;
}

export class UpdateRateDto {
  @ApiPropertyOptional({ example: 'Ocean Freight 20ft' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: RateType })
  @IsOptional()
  @IsEnum(RateType)
  type?: RateType;

  @ApiPropertyOptional({ enum: RateBasis })
  @IsOptional()
  @IsEnum(RateBasis)
  basis?: RateBasis;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @ApiPropertyOptional({ example: 'CONTAINER' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  unit?: string;

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

  @ApiPropertyOptional({ example: 'HS123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  commodityCode?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  validFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  validUntil?: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isSpot?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  surcharges?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  conditions?: Record<string, unknown>;
}

export class RateQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: RateType })
  @IsOptional()
  @IsEnum(RateType)
  type?: RateType;

  @ApiPropertyOptional({ enum: RateBasis })
  @IsOptional()
  @IsEnum(RateBasis)
  basis?: RateBasis;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isSpot?: boolean;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: 'HS123456' })
  @IsOptional()
  @IsString()
  commodityCode?: string;

  @ApiPropertyOptional({ example: 'RATE-001' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class RateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: RateType })
  type: RateType;

  @ApiProperty({ enum: RateBasis })
  basis: RateBasis;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  amount: number;

  @ApiPropertyOptional()
  minQuantity?: number;

  @ApiPropertyOptional()
  maxQuantity?: number;

  @ApiProperty()
  unit: string;

  @ApiPropertyOptional()
  origin?: string;

  @ApiPropertyOptional()
  destination?: string;

  @ApiPropertyOptional()
  commodityCode?: string;

  @ApiPropertyOptional()
  carrierId?: string;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiProperty()
  validFrom: Date;

  @ApiProperty()
  validUntil: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isSpot: boolean;

  @ApiPropertyOptional()
  surcharges?: Record<string, unknown>;

  @ApiPropertyOptional()
  conditions?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}