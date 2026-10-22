import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDate, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum FeeType {
  CUSTOMS_DUTY = 'CUSTOMS_DUTY',
  IMPORT_TAX = 'IMPORT_TAX',
  EXPORT_TAX = 'EXPORT_TAX',
  VAT = 'VAT',
  GST = 'GST',
  EXCISE_TAX = 'EXCISE_TAX',
  PROCESSING_FEE = 'PROCESSING_FEE',
  BROKERAGE_FEE = 'BROKERAGE_FEE',
  STORAGE_FEE = 'STORAGE_FEE',
  DEMURRAGE = 'DEMURRAGE',
  DETENTION = 'DETENTION',
  PENALTY = 'PENALTY',
  INTEREST = 'INTEREST',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CHECK = 'CHECK',
  CASH = 'CASH',
  ELECTRONIC_FUNDS_TRANSFER = 'ELECTRONIC_FUNDS_TRANSFER',
  LETTER_OF_CREDIT = 'LETTER_OF_CREDIT',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL = 'PARTIAL',
}

export class CreateFeeDto {
  @ApiProperty({ enum: FeeType, example: FeeType.CUSTOMS_DUTY })
  @IsEnum(FeeType)
  type: FeeType;

  @ApiProperty({ example: 'Customs duty on electronics' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description: string;

  @ApiProperty({ example: 2500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: '2024-02-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiPropertyOptional({ example: 'INV-001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  invoiceNumber?: string;

  @ApiPropertyOptional({ example: 'REC-001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  receiptNumber?: string;
}

export class FeeQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: FeeType })
  @IsOptional()
  @IsEnum(FeeType)
  type?: FeeType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}

export class PayFeeDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'TXN-123456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  transactionId?: string;

  @ApiPropertyOptional({ example: 'Paid via bank transfer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class FeeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: FeeType })
  type: FeeType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  isPaid: boolean;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  paidBy?: string;

  @ApiPropertyOptional()
  dueDate?: Date;

  @ApiPropertyOptional()
  invoiceNumber?: string;

  @ApiPropertyOptional()
  receiptNumber?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}