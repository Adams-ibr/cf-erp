import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY, ROLES_KEY, TENANT_ID_KEY, BRANCH_ID_KEY, FEATURE_FLAG_KEY, SKIP_RATE_LIMIT_KEY, RATE_LIMIT_KEY } from '../decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Record<string, unknown>): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const hasPermission = requiredPermissions.some(permission =>
      user.permissions.includes(permission) || user.permissions.includes('*'),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Required permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('Insufficient role');
    }

    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(`Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const tenantId = this.reflector.getAllAndOverride<string>(TENANT_ID_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (tenantId && user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied: Invalid tenant');
    }

    request.tenantId = user.tenantId;
    return true;
  }
}

@Injectable()
export class BranchGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const branchId = this.reflector.getAllAndOverride<string>(BRANCH_ID_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (branchId && user.branchId !== branchId) {
      throw new ForbiddenException('Access denied: Invalid branch');
    }

    request.branchId = user.branchId;
    return true;
  }
}

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // private readonly featureFlagsService: IFeatureFlagsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const flag = this.reflector.getAllAndOverride<string>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!flag) {
      return true;
    }

    // const isEnabled = await this.featureFlagsService.isEnabled(flag);
    // if (!isEnabled) {
    //   throw new ForbiddenException(`Feature ${flag} is not enabled`);
    // }

    return true;
  }
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // private readonly rateLimitingService: IRateLimitingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipRateLimit = this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipRateLimit) {
      return true;
    }

    const rateLimitConfig = this.reflector.getAllAndOverride<{ limit: number; windowMs: number }>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const key = `ratelimit:${request.ip}:${request.route?.path || request.url}`;

    // const limitInfo = await this.rateLimitingService.increment(key, rateLimitConfig.windowMs);
    // if (limitInfo.remaining < 0) {
    //   throw new TooManyRequestsException('Rate limit exceeded');
    // }

    // request.rateLimit = limitInfo;
    return true;
  }
}