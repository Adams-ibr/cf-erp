import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from './jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext): JwtUser | JwtUser[keyof JwtUser] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtUser;
    return data ? user?.[data] : user;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

export const CurrentTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId || request.headers['x-tenant-id'];
  },
);

export const CurrentBranchId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.branchId || request.headers['x-branch-id'];
  },
);

export const CurrentRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.roles || [];
  },
);

export const CurrentPermissions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.permissions || [];
  },
);

export const IsPublic = () => (target: unknown, key?: string | symbol, descriptor?: PropertyDescriptor) => {
  if (descriptor) {
    Reflect.defineMetadata('isPublic', true, descriptor.value);
  } else {
    Reflect.defineMetadata('isPublic', true, target);
  }
  return descriptor || target;
};

export const Permissions = (...permissions: string[]) => (target: unknown, key?: string | symbol, descriptor?: PropertyDescriptor) => {
  if (descriptor) {
    Reflect.defineMetadata('permissions', permissions, descriptor.value);
  } else {
    Reflect.defineMetadata('permissions', permissions, target);
  }
  return descriptor || target;
};

export const Roles = (...roles: string[]) => (target: unknown, key?: string | symbol, descriptor?: PropertyDescriptor) => {
  if (descriptor) {
    Reflect.defineMetadata('roles', roles, descriptor.value);
  } else {
    Reflect.defineMetadata('roles', roles, target);
  }
  return descriptor || target;
};