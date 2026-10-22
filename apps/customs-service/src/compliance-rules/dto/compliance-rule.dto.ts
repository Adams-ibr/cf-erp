import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, IsObject, MinLength, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum ComplianceEntityType {
  CUSTOMS_ENTRY = 'CUSTOMS_ENTRY',
  TARIFF_CODE = 'TARIFF_CODE',
  TRADE_AGREEMENT = 'TRADE_AGREEMENT',
  CUSTOMS_BROKER = 'CUSTOMS_BROKER',
  SHIPMENT = 'SHIPMENT',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  CARRIER = 'CARRIER',
  VESSEL = 'VESSEL',
  VOYAGE = 'VOYAGE',
}

export enum ComplianceRuleType {
  DOCUMENT_REQUIRED = 'DOCUMENT_REQUIRED',
  LICENSE_REQUIRED = 'LICENSE_REQUIRED',
  RESTRICTED_COUNTRY = 'RESTRICTED_COUNTRY',
  RESTRICTED_PARTY = 'RESTRICTED_PARTY',
  RESTRICTED_COMMODITY = 'RESTRICTED_COMMODITY',
  VALUE_THRESHOLD = 'VALUE_THRESHOLD',
  WEIGHT_THRESHOLD = 'WEIGHT_THRESHOLD',
  QUANTITY_LIMIT = 'QUANTITY_LIMIT',
  LABELING_REQUIREMENT = 'LABELING_REQUIREMENT',
  CERTIFICATION_REQUIRED = 'CERTIFICATION_REQUIRED',
  QUOTA_LIMIT = 'QUOTA_LIMIT',
  EMBARGO_CHECK = 'EMBARGO_CHECK',
  SANCTIONS_CHECK = 'SANCTIONS_CHECK',
  DUAL_USE_CHECK = 'DUAL_USE_CHECK',
  CUSTOM = 'CUSTOM',
}

export enum ComplianceSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  BLOCKING = 'BLOCKING',
}

export class CreateComplianceRuleDto {
  @ApiProperty({ example: 'CR-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Restricted country check for Iran' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Blocks shipments to/from Iran' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: ComplianceEntityType, example: ComplianceEntityType.SHIPMENT })
  @IsEnum(ComplianceEntityType)
  entityType: ComplianceEntityType;

  @ApiPropertyOptional({ example: 'shipment-id' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ enum: ComplianceRuleType, example: ComplianceRuleType.RESTRICTED_COUNTRY })
  @IsEnum(ComplianceRuleType)
  ruleType: ComplianceRuleType;

  @ApiProperty({ example: { countries: ['IR', 'KP', 'SY'], direction: 'both' } })
  @IsObject()
  condition: Record<string, unknown>;

  @ApiProperty({ example: { type: 'BLOCK', message: 'Shipment to restricted country not allowed' } })
  @IsObject()
  action: Record<string, unknown>;

  @ApiProperty({ enum: ComplianceSeverity, example: ComplianceSeverity.BLOCKING })
  @IsEnum(ComplianceSeverity)
  severity: ComplianceSeverity;

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

export class UpdateComplianceRuleDto {
  @ApiPropertyOptional({ example: 'Restricted country check for Iran' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Blocks shipments to/from Iran' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: ComplianceEntityType })
  @IsOptional()
  @IsEnum(ComplianceEntityType)
  entityType?: ComplianceEntityType;

  @ApiPropertyOptional({ example: 'shipment-id' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ enum: ComplianceRuleType })
  @IsOptional()
  @IsEnum(ComplianceRuleType)
  ruleType?: ComplianceRuleType;

  @ApiPropertyOptional({ example: { countries: ['IR', 'KP', 'SY'], direction: 'both' } })
  @IsOptional()
  @IsObject()
  condition?: Record<string, unknown>;

  @ApiPropertyOptional({ example: { type: 'BLOCK', message: 'Shipment to restricted country not allowed' } })
  @IsOptional()
  @IsObject()
  action?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ComplianceSeverity })
  @IsOptional()
  @IsEnum(ComplianceSeverity)
  severity?: ComplianceSeverity;

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

export class ComplianceRuleQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ComplianceEntityType })
  @IsOptional()
  @IsEnum(ComplianceEntityType)
  entityType?: ComplianceEntityType;

  @ApiPropertyOptional({ example: 'shipment-id' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ enum: ComplianceRuleType })
  @IsOptional()
  @IsEnum(ComplianceRuleType)
  ruleType?: ComplianceRuleType;

  @ApiPropertyOptional({ enum: ComplianceSeverity })
  @IsOptional()
  @IsEnum(ComplianceSeverity)
  severity?: ComplianceSeverity;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class EvaluateComplianceDto {
  @ApiProperty({ enum: ComplianceEntityType, example: ComplianceEntityType.SHIPMENT })
  @IsEnum(ComplianceEntityType)
  entityType: ComplianceEntityType;

  @ApiProperty({ example: 'shipment-id' })
  @IsUUID()
  entityId: string;

  @ApiProperty({ example: { originCountry: 'IR', destinationCountry: 'US', commodity: 'electronics' } })
  @IsObject()
  context: Record<string, unknown>;
}

export class ComplianceRuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: ComplianceEntityType })
  entityType: ComplianceEntityType;

  @ApiPropertyOptional()
  entityId?: string;

  @ApiProperty({ enum: ComplianceRuleType })
  ruleType: ComplianceRuleType;

  @ApiProperty()
  condition: Record<string, unknown>;

  @ApiProperty()
  action: Record<string, unknown>;

  @ApiProperty({ enum: ComplianceSeverity })
  severity: ComplianceSeverity;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  isActive: boolean.

  @ApiPropertyOptional()
  validFrom?: Date.

  @ApiPropertyOptional()
  validUntil?: Date.

  @ApiProperty()
  createdAt: Date.

  @ApiProperty()
  updatedAt: Date.
}

export class ComplianceEvaluationResultDto {
  @ApiProperty()
  ruleId: string;

  @ApiProperty()
  ruleCode: string;

  @ApiProperty()
  ruleName: string;

  @ApiProperty({ enum: ComplianceSeverity })
  severity: ComplianceSeverity.

  @ApiProperty()
  matched: boolean.

  @ApiPropertyOptional()
  message?: string.

  @ApiProperty()
  action: Record<string, unknown>.
}