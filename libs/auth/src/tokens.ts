import { JwtService } from '@nestjs/jwt';
import { env } from '@cf-erp/config';
import { prisma } from '@cf-erp/database';

export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: env.jwt.secret,
      expiresIn: env.jwt.expiresIn,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });
  }

  generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: env.jwt.refreshSecret,
        expiresIn: env.jwt.refreshExpiresIn,
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      },
    );
  }

  generateEmailVerificationToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'email_verification' },
      {
        secret: env.jwt.secret,
        expiresIn: '24h',
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      },
    );
  }

  generatePasswordResetToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'password_reset' },
      {
        secret: env.jwt.secret,
        expiresIn: '1h',
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      },
    );
  }

  generateInvitationToken(email: string, tenantId: string, roleId: string): string {
    return this.jwtService.sign(
      { email, tenantId, roleId, type: 'invitation' },
      {
        secret: env.jwt.secret,
        expiresIn: '7d',
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      },
    );
  }

  generateApiKeyToken(userId: string, permissions: string[]): string {
    return this.jwtService.sign(
      { sub: userId, permissions, type: 'api_key' },
      {
        secret: env.jwt.secret,
        expiresIn: '1y',
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      },
    );
  }

  verifyAccessToken(token: string): TokenPayload {
    return this.jwtService.verify(token, {
      secret: env.jwt.secret,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwtService.verify(token, {
      secret: env.jwt.refreshSecret,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });
  }

  verifyEmailVerificationToken(token: string): VerificationTokenPayload {
    return this.jwtService.verify(token, {
      secret: env.jwt.secret,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });
  }

  verifyPasswordResetToken(token: string): VerificationTokenPayload {
    return this.jwtService.verify(token, {
      secret: env.jwt.secret,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });
  }

  verifyInvitationToken(token: string): InvitationTokenPayload {
    return this.jwtService.verify(token, {
      secret: env.jwt.secret,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + this.parseExpiry(env.jwt.refreshExpiresIn) * 1000);
    await prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async revokeRefreshToken(userId: string, token?: string): Promise<void> {
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { userId, token } });
    } else {
      await prisma.refreshToken.deleteMany({ where: { userId } });
    }
  }

  async validateRefreshToken(token: string): Promise<boolean> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    return !!storedToken && storedToken.expiresAt > new Date();
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
}

export interface TokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  branchId?: string;
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export interface VerificationTokenPayload {
  sub: string;
  type: 'email_verification' | 'password_reset';
}

export interface InvitationTokenPayload {
  email: string;
  tenantId: string;
  roleId: string;
  type: 'invitation';
}

export interface ApiKeyTokenPayload {
  sub: string;
  permissions: string[];
  type: 'api_key';
}