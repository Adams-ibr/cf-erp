import { IsString, IsOptional, IsEnum, IsUUID, IsDate, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum ExamType {
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  X_RAY = 'X_RAY',
  PHYSICAL_EXAM = 'PHYSICAL_EXAM',
  TAILGATE = 'TAILGATE',
  INTENSIVE = 'INTENSIVE',
  NON_INTRUSIVE = 'NON_INTRUSIVE',
  CANINE = 'CANINE',
  RADIATION = 'RADIATION',
  WEIGHING = 'WEIGHING',
  SAMPLING = 'SAMPLING',
}

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export enum ExamResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING',
  REQUIRES_FURTHER_ACTION = 'REQUIRES_FURTHER_ACTION',
}

export class CreateInspectionDto {
  @ApiProperty({ enum: ExamType, example: ExamType.PHYSICAL_EXAM })
  @IsEnum(ExamType)
  type: ExamType;

  @ApiPropertyOptional({ example: '2024-01-20T10:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @ApiPropertyOptional({ example: 'Port of Los Angeles - Terminal 1' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: 'Officer John Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  officer?: string;

  @ApiPropertyOptional({ example: 'CBP' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  agency?: string;

  @ApiPropertyOptional({ example: 'Random inspection' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateInspectionDto {
  @ApiPropertyOptional({ enum: ExamType })
  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @ApiPropertyOptional({ enum: InspectionStatus })
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedDate?: Date;

  @ApiPropertyOptional({ example: 'Port of Los Angeles - Terminal 1' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: 'Officer John Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  officer?: string;

  @ApiPropertyOptional({ example: 'CBP' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  agency?: string;

  @ApiPropertyOptional({ enum: ExamResult })
  @IsOptional()
  @IsEnum(ExamResult)
  result?: ExamResult;

  @ApiPropertyOptional({ example: 'No issues found' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  findings?: string;

  @ApiPropertyOptional({ example: 'Random inspection' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class InspectionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ExamType })
  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @ApiPropertyOptional({ enum: InspectionStatus })
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @ApiPropertyOptional({ enum: ExamResult })
  @IsOptional()
  @IsEnum(ExamResult)
  result?: ExamResult;
}

export class InspectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ExamType })
  type: ExamType;

  @ApiProperty({ enum: InspectionStatus })
  status: InspectionStatus;

  @ApiPropertyOptional()
  scheduledDate?: Date;

  @ApiPropertyOptional()
  completedDate?: Date;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  officer?: string;

  @ApiPropertyOptional()
  agency?: string;

  @ApiPropertyOptional({ enum: ExamResult })
  result?: ExamResult;

  @ApiPropertyOptional()
  findings?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}