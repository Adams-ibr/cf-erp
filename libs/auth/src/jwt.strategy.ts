import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '@cf-erp/config';
import { prisma } from '@cf-erp/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.jwt.secret,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
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
        branches: true,
        tenant: true,
      },
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

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
      branchId: user.branchId,
      roles,
      permissions,
      mfaEnabled: user.mfaEnabled,
    };
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  branchId?: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface JwtUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  branchId?: string;
  roles: string[];
  permissions: string[];
  mfaEnabled: boolean;
}