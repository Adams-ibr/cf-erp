import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum ContainerType {
  DRY_20FT = 'DRY_20FT',
  DRY_40FT = 'DRY_40FT',
  DRY_40FT_HC = 'DRY_40FT_HC',
  DRY_45FT_HC = 'DRY_45FT_HC',
  REEFER_20FT = 'REEFER_20FT',
  REEFER_40FT = 'REEFER_40FT',
  REEFER_40FT_HC = 'REEFER_40FT_HC',
  OPEN_TOP_20FT = 'OPEN_TOP_20FT',
  OPEN_TOP_40FT = 'OPEN_TOP_40FT',
  FLAT_RACK_20FT = 'FLAT_RACK_20FT',
  FLAT_RACK_40FT = 'FLAT_RACK_40FT',
  TANK_20FT = 'TANK_20FT',
  TANK_40FT = 'TANK_40FT',
  SPECIAL = 'SPECIAL',
}

export enum SpaceStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  ALLOCATED = 'ALLOCATED',
  RELEASED = 'RELEASED',
  CANCELLED = 'CANCELLED',
  WAITLISTED = 'WAITLISTED',
}

export class CreateSpaceDto {
  @ApiProperty({ enum: ContainerType, example: ContainerType.DRY_40FT_HC })
  @IsEnum(ContainerType)
  containerType: ContainerType;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  containerCount: number;

  @ApiPropertyOptional({ example: 28000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightLimit?: number;

  @ApiPropertyOptional({ example: 76 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volumeLimit?: number;

  @ApiPropertyOptional({ example: 'rate-id' })
  @IsOptional()
  @IsUUID()
  rateId?: string;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateAmount?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  rateCurrency?: string;
}

export class UpdateSpaceDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  containerCount?: number;

  @ApiPropertyOptional({ example: 28000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightLimit?: number;

  @ApiPropertyOptional({ example: 76 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volumeLimit?: number;

  @ApiPropertyOptional({ example: 'rate-id' })
  @IsOptional()
  @IsUUID()
  rateId?: string;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateAmount?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  rateCurrency?: string;

  @ApiPropertyOptional({ enum: SpaceStatus })
  @IsOptional()
  @IsEnum(SpaceStatus)
  status?: SpaceStatus;
}

export class SpaceQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ContainerType })
  @IsOptional()
  @IsEnum(ContainerType)
  containerType?: ContainerType;

  @ApiPropertyOptional({ enum: SpaceStatus })
  @IsOptional()
  @IsEnum(SpaceStatus)
  status?: SpaceStatus;
}

export class SpaceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty({ enum: ContainerType })
  containerType: ContainerType;

  @ApiProperty()
  containerCount: number;

  @ApiPropertyOptional()
  weightLimit?: number;

  @ApiPropertyOptional()
  volumeLimit?: number;

  @ApiPropertyOptional()
  rateId?: string;

  @ApiPropertyOptional()
  rateAmount?: number;

  @ApiPropertyOptional()
  rateCurrency?: string;

  @ApiProperty({ enum: SpaceStatus })
  status: SpaceStatus;

  @ApiPropertyOptional()
  allocatedAt?: Date;

  @ApiPropertyOptional()
  releasedAt?: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ type: () => SpaceAllocationResponseDto, isArray: true })
  allocations?: SpaceAllocationResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SpaceAllocationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingSpaceId: string;

  @ApiProperty()
  containerId: string;

  @ApiProperty()
  containerNumber: string;

  @ApiPropertyOptional()
  sealNumber?: string;

  @ApiProperty()
  allocatedAt: Date;

  @ApiPropertyOptional()
  releasedAt?: Date;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}