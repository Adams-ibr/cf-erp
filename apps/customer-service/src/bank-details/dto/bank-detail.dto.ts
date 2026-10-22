import { IsString, IsOptional, IsUUID, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export class CreateBankDetailDto {
  @ApiProperty({ example: 'Bank of America' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  bankName: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  accountName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  accountNumber: string;

  @ApiPropertyOptional({ example: 'US123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  iban?: string;

  @ApiPropertyOptional({ example: 'BOFAUS3N' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  swiftBic?: string;

  @ApiPropertyOptional({ example: '021000021' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  routingNumber?: string;

  @ApiPropertyOptional({ example: 'Main Branch' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  branchName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  branchAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}

export class UpdateBankDetailDto {
  @ApiPropertyOptional({ example: 'Bank of America' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  accountName?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'US123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  iban?: string;

  @ApiPropertyOptional({ example: 'BOFAUS3N' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  swiftBic?: string;

  @ApiPropertyOptional({ example: '021000021' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  routingNumber?: string;

  @ApiPropertyOptional({ example: 'Main Branch' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  branchName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  branchAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BankDetailQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'customer-id' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BankDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  accountName: string;

  @ApiProperty()
  accountNumber: string;

  @ApiPropertyOptional()
  iban?: string;

  @ApiPropertyOptional()
  swiftBic?: string;

  @ApiPropertyOptional()
  routingNumber?: string;

  @ApiPropertyOptional()
  branchName?: string;

  @ApiPropertyOptional()
  branchAddress?: Record<string, unknown>;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  customerId?: string;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}