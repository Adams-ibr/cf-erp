import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum VoyageStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
}

export class CreateVoyageDto {
  @ApiProperty({ example: 'VOY-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'MSC Gülsün - Voyage 001' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'AEU' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  serviceCode?: string;

  @ApiProperty({ example: 'vessel-id' })
  @IsUUID()
  vesselId: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiProperty({ example: 'Shanghai' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  pol: string;

  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  pod: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  etd: Date;

  @ApiProperty({ example: '2024-02-10T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  eta: Date;

  @ApiPropertyOptional({ example: '2024-01-10T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cutoffDate?: Date;

  @ApiPropertyOptional({ example: '2024-01-12T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  docsCutoff?: Date;

  @ApiPropertyOptional({ example: '2024-01-11T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  vgmCutoff?: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: () => [AddScheduleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddScheduleDto)
  schedules?: AddScheduleDto[];
}

export class UpdateVoyageDto {
  @ApiPropertyOptional({ example: 'MSC Gülsün - Voyage 001' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'AEU' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  serviceCode?: string;

  @ApiPropertyOptional({ example: 'vessel-id' })
  @IsOptional()
  @IsUUID()
  vesselId?: string;

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string.

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  pol?: string;

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  pod?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  etd?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  eta?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  atd?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ata?: Date.

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cutoffDate?: Date.

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  docsCutoff?: Date.

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  vgmCutoff?: Date.

  @ApiPropertyOptional({ enum: VoyageStatus })
  @IsOptional()
  @IsEnum(VoyageStatus)
  status?: VoyageStatus.

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean.
}

export class AddScheduleDto {
  @ApiProperty({ example: 'CNSHA' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  portCode: string;

  @ApiProperty({ example: 'Shanghai' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  portName: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  sequence: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  etd?: Date.

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  eta?: Date.

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isTransshipment?: boolean.

  @ApiPropertyOptional({ example: 'Feeder port' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string.
}

export class VoyageQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: VoyageStatus })
  @IsOptional()
  @IsEnum(VoyageStatus)
  status?: VoyageStatus.

  @ApiPropertyOptional({ example: 'vessel-id' })
  @IsOptional()
  @IsUUID()
  vesselId?: string.

  @ApiPropertyOptional({ example: 'carrier-id' })
  @IsOptional()
  @IsUUID()
  carrierId?: string.

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean.

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  pol?: string.

  @ApiPropertyOptional({ example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  pod?: string.

  @ApiPropertyOptional({ example: 'VOY-001' })
  @IsOptional()
  @IsString()
  search?: string.
}

export class VoyageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string.

  @ApiPropertyOptional()
  serviceCode?: string.

  @ApiProperty()
  vesselId: string.

  @ApiPropertyOptional()
  carrierId?: string.

  @ApiProperty()
  pol: string.

  @ApiProperty()
  pod: string.

  @ApiProperty()
  etd: Date.

  @ApiProperty()
  eta: Date.

  @ApiPropertyOptional()
  atd?: Date.

  @ApiPropertyOptional()
  ata?: Date.

  @ApiPropertyOptional()
  cutoffDate?: Date.

  @ApiPropertyOptional()
  docsCutoff?: Date.

  @ApiPropertyOptional()
  vgmCutoff?: Date.

  @ApiProperty({ enum: VoyageStatus })
  status: VoyageStatus.

  @ApiProperty()
  isActive: boolean.

  @ApiPropertyOptional({ type: () => VoyageScheduleResponseDto, isArray: true })
  schedules?: VoyageScheduleResponseDto[].

  @ApiProperty()
  createdAt: Date.

  @ApiProperty()
  updatedAt: Date.
}

export class VoyageScheduleResponseDto {
  @ApiProperty()
  id: string.

  @ApiProperty()
  portCode: string.

  @ApiProperty()
  portName: string.

  @ApiProperty()
  sequence: number.

  @ApiPropertyOptional()
  etd?: Date.

  @ApiPropertyOptional()
  eta?: Date.

  @ApiPropertyOptional()
  atd?: Date.

  @ApiPropertyOptional()
  ata?: Date.

  @ApiProperty()
  isTransshipment: boolean.

  @ApiPropertyOptional()
  notes?: string.

  @ApiProperty()
  createdAt: Date.

  @ApiProperty()
  updatedAt: Date.
}