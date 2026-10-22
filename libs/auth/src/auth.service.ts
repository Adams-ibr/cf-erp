import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { env } from '@cf-erp/config';
import { prisma } from '@cf-erp/database';
import { JwtUser } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<JwtUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        tenant: true,
      },
    });

    if (!user || user.isDeleted) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.recordFailedLogin(user.id);
      return null;
    }

    await this.recordSuccessfulLogin(user.id);

    const permissions = user.roles.flatMap(ur =>
      ur.role.permissions.map(rp => rp.permission.code),
    );

    const roles = user.roles.map(ur => ur.role.code);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      branchId: user.branchId || undefined,
      roles,
      permissions,
      mfaEnabled: user.mfaEnabled,
    };
  }

  async login(user: JwtUser): Promise<AuthTokens> {
    const payload = this.createPayload(user);
    const accessToken = this.jwtService.sign(payload, {
      secret: env.jwt.secret,
      expiresIn: env.jwt.expiresIn,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: env.jwt.refreshSecret,
        expiresIn: env.jwt.refreshExpiresIn,
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      },
    );

    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(env.jwt.expiresIn),
      tokenType: 'Bearer',
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: env.jwt.refreshSecret,
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired or revoked');
      }

      const user = storedToken.user;
      if (!user.isActive || user.isDeleted) {
        throw new UnauthorizedException('User account is inactive');
      }

      await prisma.refreshToken.delete({ where: { id: storedToken.id } });

      const jwtUser: JwtUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        branchId: user.branchId || undefined,
        roles: user.roles.map(ur => ur.role.code),
        permissions: user.roles.flatMap(ur =>
          ur.role.permissions.map(rp => rp.permission.code),
        ),
        mfaEnabled: user.mfaEnabled,
      };

      return this.login(jwtUser);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      await prisma.refreshToken.deleteMany({ where: { userId } });
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async resetPassword(email: string, newPassword: string, token: string): Promise<void> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (resetToken.user.email !== email) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return;
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // Send email with reset link
    // await this.emailService.sendPasswordReset(user.email, token);
  }

  async register(data: RegisterInput): Promise<JwtUser> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: hashedPassword,
        tenantId: data.tenantId,
        branchId: data.branchId,
        isActive: true,
        mfaEnabled: false,
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    const permissions = user.roles.flatMap(ur =>
      ur.role.permissions.map(rp => rp.permission.code),
    );

    const roles = user.roles.map(ur => ur.role.code);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      branchId: user.branchId || undefined,
      roles,
      permissions,
      mfaEnabled: user.mfaEnabled,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private createPayload(user: JwtUser) {
    return {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      branchId: user.branchId,
      roles: user.roles,
      permissions: user.permissions,
    };
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 86400;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 86400;
    }
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + this.parseExpiry(env.jwt.refreshExpiresIn) * 1000);
    await prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  private async recordFailedLogin(userId: string): Promise<void> {
    await prisma.loginAttempt.create({
      data: { userId, success: false, ipAddress: 'unknown', userAgent: 'unknown' },
    });
  }

  private async recordSuccessfulLogin(userId: string): Promise<void> {
    await prisma.loginAttempt.create({
      data: { userId, success: true, ipAddress: 'unknown', userAgent: 'unknown' },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  tenantId: string;
  branchId?: string;
}