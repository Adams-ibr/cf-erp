import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const TENANT_ID_KEY = 'tenantId';
export const CurrentTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId || request.headers['x-tenant-id'];
  },
);

export const BRANCH_ID_KEY = 'branchId';
export const CurrentBranchId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.branchId || request.headers['x-branch-id'];
  },
);

export const USER_ID_KEY = 'userId';
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id || request.user?.sub;
  },
);

export const CURRENT_USER_KEY = 'currentUser';
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const SKIP_RATE_LIMIT_KEY = 'skipRateLimit';
export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);

export const RATE_LIMIT_KEY = 'rateLimit';
export const RateLimit = (limit: number, windowMs: number) => SetMetadata(RATE_LIMIT_KEY, { limit, windowMs });

export const AUDIT_LOG_KEY = 'auditLog';
export const AuditLog = (action: string, resource: string) => SetMetadata(AUDIT_LOG_KEY, { action, resource });

export const SKIP_AUDIT_LOG_KEY = 'skipAuditLog';
export const SkipAuditLog = () => SetMetadata(SKIP_AUDIT_LOG_KEY, true);

export const VALIDATION_GROUPS_KEY = 'validationGroups';
export const ValidationGroups = (...groups: string[]) => SetMetadata(VALIDATION_GROUPS_KEY, groups);

export const TRANSFORM_GROUPS_KEY = 'transformGroups';
export const TransformGroups = (...groups: string[]) => SetMetadata(TRANSFORM_GROUPS_KEY, groups);

export const CACHE_KEY = 'cache';
export const Cache = (ttl: number, key?: string) => SetMetadata(CACHE_KEY, { ttl, key });

export const SKIP_CACHE_KEY = 'skipCache';
export const SkipCache = () => SetMetadata(SKIP_CACHE_KEY, true);

export const IDEMPOTENCY_KEY = 'idempotency';
export const Idempotency = (key?: string) => SetMetadata(IDEMPOTENCY_KEY, key);

export const FEATURE_FLAG_KEY = 'featureFlag';
export const FeatureFlag = (flag: string) => SetMetadata(FEATURE_FLAG_KEY, flag);