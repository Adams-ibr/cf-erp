import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, Invitation } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { TokenService } from '@cf-erp/auth';
import { CreateInvitationDto } from './dto/invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly tokenService: TokenService,
  ) {}

  async create(
    tenantId: string,
    invitedBy: string,
    createInvitationDto: CreateInvitationDto,
  ): Promise<Invitation> {
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: createInvitationDto.email.toLowerCase(),
        tenantId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      throw new ConflictException('An active invitation already exists for this email');
    }

    const role = await this.prisma.role.findFirst({
      where: { id: createInvitationDto.roleId, tenantId, isDeleted: false },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const token = this.tokenService.generateInvitationToken(
      createInvitationDto.email,
      tenantId,
      createInvitationDto.roleId,
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.prisma.invitation.create({
      data: {
        email: createInvitationDto.email.toLowerCase(),
        roleId: createInvitationDto.roleId,
        tenantId,
        branchId: createInvitationDto.branchId,
        token,
        invitedBy,
        expiresAt,
      },
    });

    // Send invitation email
    // await this.emailService.sendInvitation(invitation.email, token);

    return invitation;
  }

  async accept(token: string): Promise<{ userId: string; tenantId: string }> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { role: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.acceptedAt) {
      throw new ConflictException('Invitation already accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new ConflictException('Invitation has expired');
    }

    const payload = this.tokenService.verifyInvitationToken(token);

    // Create user account
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        firstName: payload.firstName || 'User',
        lastName: payload.lastName || '',
        passwordHash: '', // Will be set during password setup
        tenantId: payload.tenantId,
        branchId: payload.branchId,
        isActive: true,
        isEmailVerified: true,
      },
    });

    // Assign role
    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: payload.roleId,
      },
    });

    // Mark invitation as accepted
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return { userId: user.id, tenantId: payload.tenantId };
  }

  async resend(tenantId: string, invitationId: string): Promise<Invitation> {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, tenantId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new ConflictException('Invitation already accepted');
    }

    const token = this.tokenService.generateInvitationToken(
      invitation.email,
      invitation.tenantId,
      invitation.roleId,
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updatedInvitation = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { token, expiresAt },
    });

    // Send invitation email
    // await this.emailService.sendInvitation(updatedInvitation.email, token);

    return updatedInvitation;
  }

  async cancel(tenantId: string, invitationId: string): Promise<void> {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, tenantId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new ConflictException('Cannot cancel accepted invitation');
    }

    await this.prisma.invitation.delete({ where: { id: invitationId } });
  }

  async findByTenant(tenantId: string): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export class CreateInvitationDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'role-id' })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({ example: 'branch-id' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;
}