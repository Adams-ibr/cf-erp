import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, IsArray, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum TradeAgreementType {
  FTA = 'FTA',
  PTA = 'PTA',
  CEPA = 'CEPA',
  GSP = 'GSP',
  AGOA = 'AGOA',
  USMCA = 'USMCA',
  CPTPP = 'CPTPP',
  RCEP = 'RCEP',
  EU_JAPAN = 'EU_JAPAN',
  EU_CANADA = 'EU_CANADA',
  EU_SINGAPORE = 'EU_SINGAPORE',
  EU_VIETNAM = 'EU_VIETNAM',
  EU_MERCOSUR = 'EU_MERCOSUR',
  BILATERAL = 'BILATERAL',
  MULTILATERAL = 'MULTILATERAL',
  OTHER = 'OTHER',
}

export class CreateTradeAgreementDto {
  @ApiProperty({ example: 'USMCA' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'United States-Mexico-Canada Agreement' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: TradeAgreementType, example: TradeAgreementType.FTA })
  @IsEnum(TradeAgreementType)
  type: TradeAgreementType;

  @ApiProperty({ type: [String], example: ['US', 'CA', 'MX'] })
  @IsArray()
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(2, { each: true })
  countries: string[];

  @ApiPropertyOptional({ example: 'Free trade agreement between US, Canada, and Mexico' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  validFrom: Date;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date;

  @ApiPropertyOptional({ example: 0.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  preferentialDuty?: number;

  @ApiPropertyOptional({ example: { rule: 'wholly_obtained', value: '100%' } })
  @IsOptional()
  rulesOfOrigin?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  certificateRequired?: boolean;
}

export class UpdateTradeAgreementDto {
  @ApiPropertyOptional({ example: 'United States-Mexico-Canada Agreement' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: TradeAgreementType })
  @IsOptional()
  @IsEnum(TradeAgreementType)
  type?: TradeAgreementType;

  @ApiPropertyOptional({ type: [String], example: ['US', 'CA', 'MX'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional({ example: 'Free trade agreement between US, Canada, and Mexico' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

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

  @ApiPropertyOptional({ example: 0.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  preferentialDuty?: number;

  @ApiPropertyOptional({ example: { rule: 'wholly_obtained', value: '100%' } })
  @IsOptional()
  rulesOfOrigin?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  certificateRequired?: boolean;
}

export class TradeAgreementQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TradeAgreementType })
  @IsOptional()
  @IsEnum(TradeAgreementType)
  type?: TradeAgreementType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ example: 'USMCA' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class TradeAgreementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: TradeAgreementType })
  type: TradeAgreementType;

  @ApiProperty({ type: [String] })
  countries: string[];

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  validFrom: Date;

  @ApiPropertyOptional()
  validUntil?: Date;

  @ApiPropertyOptional()
  preferentialDuty?: number;

  @ApiPropertyOptional()
  rulesOfOrigin?: Record<string, unknown>;

  @ApiProperty()
  certificateRequired: boolean;

  @ApiPropertyOptional({ type: () => TradeAgreementTariffResponseDto, isArray: true })
  tariffs?: TradeAgreementTariffResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TradeAgreementTariffResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tariffCodeId: string;

  @ApiProperty()
  preferentialRate: number;

  @ApiPropertyOptional()
  rulesOfOrigin?: Record<string, unknown>;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ type: () => TariffCodeSummaryDto })
  tariffCode?: TariffCodeSummaryDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TariffCodeSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  dutyRate: number;
}