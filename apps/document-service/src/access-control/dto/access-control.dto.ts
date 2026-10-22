import { IsString, IsOptional, IsEnum, IsUUID, IsDate, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@cf-erp/shared';

export enum AccessPrincipalType {
  USER = 'USER',
  ROLE = 'ROLE',
  GROUP = 'GROUP',
  DEPARTMENT = 'DEPARTMENT',
  TENANT = 'TENANT',
}

export enum AccessPermission {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  ADMIN = 'ADMIN',
  VERSION_CONTROL = 'VERSION_CONTROL',
}

export class CreateAccessRuleDto {
  @ApiProperty({ enum: AccessPrincipalType, example: AccessPrincipalType.USER })
  @IsEnum(AccessPrincipalType)
  principalType: AccessPrincipalType;

  @ApiProperty({ example: 'user-id' })
  @IsString()
  @MinLength(1)
  principalId: string;

  @ApiProperty({ enum: AccessPermission, example: AccessPermission.READ })
  @IsEnum(AccessPermission)
  permission: AccessPermission;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  inherits?: boolean;

  @ApiPropertyOptional({ example: { ipRange: '192.168.1.0/24' } })
  @IsOptional()
  conditions?: Record<string, unknown>;
}

export class AccessRuleQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AccessPrincipalType })
  @IsOptional()
  @IsEnum(AccessPrincipalType)
  principalType?: AccessPrincipalType;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsString()
  principalId?: string;

  @ApiPropertyOptional({ enum: AccessPermission })
  @IsOptional()
  @IsEnum(AccessPermission)
  permission?: AccessPermission;
}

export class AccessRuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentId: string;

  @ApiProperty()
  folderId: string;

  @ApiProperty({ enum: AccessPrincipalType })
  principalType: AccessPrincipalType;

  @ApiProperty()
  principalId: string;

  @ApiProperty({ enum: AccessPermission })
  permission: AccessPermission;

  @ApiProperty()
  grantedBy: string;

  @ApiProperty()
  grantedAt: Date;

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiProperty()
  inherits: boolean;

  @ApiPropertyOptional()
  conditions?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateShareDto {
  @ApiProperty({ example: 'user-id' })
  @IsString()
  @MinLength(1)
  sharedWith: string;

  @ApiProperty({ enum: AccessPermission, example: AccessPermission.READ })
  @IsEnum(AccessPermission)
  permission: AccessPermission;

  @ApiPropertyOptional({ example: 'Please review this document' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}

export class ShareResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentId: string;

  @ApiProperty()
  sharedBy: string;

  @ApiProperty()
  sharedWith: string;

  @ApiProperty({ enum: AccessPermission })
  permission: AccessPermission;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiPropertyOptional()
  accessedAt?: Date;

  @ApiProperty()
  accessCount: number;

  @ApiProperty()
  token: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}