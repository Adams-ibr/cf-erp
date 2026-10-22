import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum AllocationStatus {
  ALLOCATED = 'ALLOCATED',
  RELEASED = 'RELEASED',
  CANCELLED = 'CANCELLED',
}

export class CreateAllocationDto {
  @ApiProperty({ example: 'container-id' })
  @IsUUID()
  containerId: string;

  @ApiPropertyOptional({ example: 'SEAL123456' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sealNumber?: string;

  @ApiPropertyOptional({ example: 'Allocated for shipment' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class AllocationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AllocationStatus })
  @IsOptional()
  status?: AllocationStatus;

  @ApiPropertyOptional({ example: 'container-id' })
  @IsOptional()
  @IsUUID()
  containerId?: string;
}

export class AllocationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

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

  @ApiProperty({ enum: AllocationStatus })
  status: AllocationStatus;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}