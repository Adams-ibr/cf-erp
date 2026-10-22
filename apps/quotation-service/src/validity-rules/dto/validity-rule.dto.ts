import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, IsObject, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum ValidityEntityType {
  QUOTATION = 'QUOTATION',
  RATE = 'RATE',
  RATE_CARD = 'RATE_CARD',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  LANE = 'LANE',
  COMMODITY = 'COMMODITY',
}

export enum ValidityRuleType {
  DATE_RANGE = 'DATE_RANGE',
  QUANTITY_RANGE = 'QUANTITY_RANGE',
  WEIGHT_RANGE = 'WEIGHT_RANGE',
  VOLUME_RANGE = 'VOLUME_RANGE',
  ORIGIN_DESTINATION = 'ORIGIN_DESTINATION',
  COMMODITY = 'COMMODITY',
  CUSTOMER_GROUP = 'CUSTOMER_GROUP',
  SEASONAL = 'SEASONAL',
  CURRENCY = 'CURRENCY',
  CUSTOM = 'CUSTOM',
}

export class CreateValidityRuleDto {
  @ApiProperty({ example: 'VR-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Peak Season Surcharge' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Applies peak season surcharge from Nov to Mar' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: ValidityEntityType, example: ValidityEntityType.RATE })
  @IsEnum(ValidityEntityType)
  entityType: ValidityEntityType;

  @ApiPropertyOptional({ example: 'rate-id' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ enum: ValidityRuleType, example: ValidityRuleType.SEASONAL })
  @IsEnum(ValidityRuleType)
  ruleType: ValidityRuleType;

  @ApiProperty({ example: { months: [11, 12, 1, 2, 3], surchargePercent: 15 } })
  @IsObject()
  condition: Record<string, unknown>;

  @ApiProperty({ example: { type: 'SURCHARGE', value: 15, unit: 'PERCENT' } })
  @IsObject()
  action: Record<string, unknown>;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priority?: number;

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
}

export class UpdateValidityRuleDto {
  @ApiPropertyOptional({ example: 'Peak Season Surcharge' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Applies peak season surcharge from Nov to Mar' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: ValidityEntityType })
  @IsOptional()
  @IsEnum(ValidityEntityType)
  entityType?: ValidityEntityType;

  @ApiPropertyOptional({ example: 'rate-id' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ enum: ValidityRuleType })
  @IsOptional()
  @IsEnum(ValidityRuleType)
  ruleType?: ValidityRuleType;

  @ApiPropertyOptional({ example: { months: [11, 12, 1, 2, 3], surchargePercent: 15 } })
  @IsOptional()
  @IsObject()
  condition?: Record<string, unknown>;

  @ApiPropertyOptional({ example: { type: 'SURCHARGE', value: 15, unit: 'PERCENT' } })
  @IsOptional()
  @IsObject()
  action?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priority?: number;

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
}

export class ValidityRuleQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ValidityEntityType })
  @IsOptional()
  @IsEnum(ValidityEntityType)
  entityType?: ValidityEntityType;

  @ApiPropertyOptional({ example: 'rate-id' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ enum: ValidityRuleType })
  @IsOptional()
  @IsEnum(ValidityRuleType)
  ruleType?: ValidityRuleType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'VR-001' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ValidityRuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: ValidityEntityType })
  entityType: ValidityEntityType;

  @ApiPropertyOptional()
  entityId?: string;

  @ApiProperty({ enum: ValidityRuleType })
  ruleType: ValidityRuleType;

  @ApiProperty()
  condition: Record<string, unknown>;

  @ApiProperty()
  action: Record<string, unknown>;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  validFrom?: Date;

  @ApiPropertyOptional()
  validUntil?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}