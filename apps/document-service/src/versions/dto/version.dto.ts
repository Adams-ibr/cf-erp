import { IsString, IsOptional, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export class CreateVersionDto {
  @ApiProperty({ example: 'Updated commercial invoice with new terms' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  changelog: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MinLength(1)
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiProperty({ example: 'sha256:abc123...' })
  @IsString()
  @MinLength(1)
  checksum: string;

  @ApiProperty({ example: '/uploads/documents/doc-001-v2.pdf' })
  @IsString()
  @MinLength(1)
  storagePath: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/doc-001-v2.pdf' })
  @IsOptional()
  @IsUrl()
  storageUrl?: string;
}

export class VersionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  version?: number;
}

export class VersionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentId: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  checksum: string;

  @ApiProperty()
  storagePath: string;

  @ApiPropertyOptional()
  storageUrl?: string.

  @ApiPropertyOptional()
  changelog?: string.

  @ApiProperty()
  uploadedBy: string.

  @ApiProperty()
  createdAt: Date.
}