import { IsString, IsOptional, IsUUID, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum ActivityType {
  NOTE = 'NOTE',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  TASK = 'TASK',
  QUOTATION_SENT = 'QUOTATION_SENT',
  QUOTATION_ACCEPTED = 'QUOTATION_ACCEPTED',
  ORDER_CREATED = 'ORDER_CREATED',
  SHIPMENT_BOOKED = 'SHIPMENT_BOOKED',
  DOCUMENT_RECEIVED = 'DOCUMENT_RECEIVED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  COMPLAINT = 'COMPLAINT',
  OTHER = 'OTHER',
}

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, example: ActivityType.NOTE })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ example: 'Follow up call' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @ApiPropertyOptional({ example: 'Called to discuss shipping schedule' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}

export class ActivityQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: 'call' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ActivityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ActivityType })
  type: ActivityType;

  @ApiProperty()
  subject: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional()
  customerId?: string;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;
}