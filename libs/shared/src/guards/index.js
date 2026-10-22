"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = exports.FeatureFlagGuard = exports.BranchGuard = exports.TenantGuard = exports.RolesGuard = exports.PermissionsGuard = exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const decorators_1 = require("../decorators");
let AuthGuard = class AuthGuard {
    jwtService;
    reflector;
    constructor(jwtService, reflector) {
        this.jwtService = jwtService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(decorators_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Authentication token is required');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token);
            request.user = payload;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        return true;
    }
    extractTokenFromHeader(request) {
        const authHeader = request.headers?.authorization;
        if (!authHeader || typeof authHeader !== 'string') {
            return undefined;
        }
        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        core_1.Reflector])
], AuthGuard);
let PermissionsGuard = class PermissionsGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(decorators_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.permissions) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        const hasPermission = requiredPermissions.some(permission => user.permissions.includes(permission) || user.permissions.includes('*'));
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`Required permissions: ${requiredPermissions.join(', ')}`);
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionsGuard);
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(decorators_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.roles) {
            throw new common_1.ForbiddenException('Insufficient role');
        }
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
        const hasRole = requiredRoles.some(role => userRoles.includes(role));
        if (!hasRole) {
            throw new common_1.ForbiddenException(`Required roles: ${requiredRoles.join(', ')}`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
let TenantGuard = class TenantGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        const tenantId = this.reflector.getAllAndOverride(decorators_1.TENANT_ID_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (tenantId && user.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied: Invalid tenant');
        }
        request.tenantId = user.tenantId;
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TenantGuard);
let BranchGuard = class BranchGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        const branchId = this.reflector.getAllAndOverride(decorators_1.BRANCH_ID_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (branchId && user.branchId !== branchId) {
            throw new common_1.ForbiddenException('Access denied: Invalid branch');
        }
        request.branchId = user.branchId;
        return true;
    }
};
exports.BranchGuard = BranchGuard;
exports.BranchGuard = BranchGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], BranchGuard);
let FeatureFlagGuard = class FeatureFlagGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const flag = this.reflector.getAllAndOverride(decorators_1.FEATURE_FLAG_KEY, [
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
};
exports.FeatureFlagGuard = FeatureFlagGuard;
exports.FeatureFlagGuard = FeatureFlagGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], FeatureFlagGuard);
let RateLimitGuard = class RateLimitGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const skipRateLimit = this.reflector.getAllAndOverride(decorators_1.SKIP_RATE_LIMIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipRateLimit) {
            return true;
        }
        const rateLimitConfig = this.reflector.getAllAndOverride(decorators_1.RATE_LIMIT_KEY, [
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
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RateLimitGuard);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBc0g7QUFDdEgsdUNBQXlDO0FBQ3pDLHFDQUF5QztBQUN6Qyw4Q0FBK0o7QUFHeEosSUFBTSxTQUFTLEdBQWYsTUFBTSxTQUFTO0lBRUQ7SUFDQTtJQUZuQixZQUNtQixVQUFzQixFQUN0QixTQUFvQjtRQURwQixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFDcEMsQ0FBQztJQUVKLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBeUI7UUFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBVSwwQkFBYSxFQUFFO1lBQ3hFLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDcEIsT0FBTyxDQUFDLFFBQVEsRUFBRTtTQUNuQixDQUFDLENBQUM7UUFFSCxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWCxNQUFNLElBQUksOEJBQXFCLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6RCxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUN6QixDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1AsTUFBTSxJQUFJLDhCQUFxQixDQUFDLDBCQUEwQixDQUFDLENB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eUI7UUFDekMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBVSxnQ0FBbUIsRUFBRTtZQUNuRixPQUFPLENBQUMsVUFBVSxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxRQUFRLEVBQUU7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNsQixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFzQywyQkFBYyxFQUFFO1lBQzVHLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDcEIsT0FBTyxDQUFDLFFBQVEsRUFBRTtTQUNuQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BELE1BQU0sR0FBRyxHQUFHLGFBQWEsT0FBTyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFNUUsNkZBQTZGO1FBQzdGLGlDQUFpQztRQUNqQywrREFBK0Q7UUFDL0QsSUFBSTtRQUVKLGlDQUFpQztRQUNqQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRixDQUFBO0FBcENZLHdDQUFjO3lCQUFkLGNBQWM7SUFEMUIsSUFBQSxtQkFBVSxHQUFFO3FDQUdtQixnQkFBUztHQUY1QixjQUFjLENBb0MxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIENhbkFjdGl2YXRlLCBFeGVjdXRpb25Db250ZXh0LCBGb3JiaWRkZW5FeGNlcHRpb24sIFVuYXV0aG9yaXplZEV4Y2VwdGlvbiB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IFJlZmxlY3RvciB9IGZyb20gJ0BuZXN0anMvY29yZSc7XG5pbXBvcnQgeyBKd3RTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9qd3QnO1xuaW1wb3J0IHsgSVNfUFVCTElDX0tFWSwgUEVSTUlTU0lPTlNfS0VZLCBST0xFU19LRVksIFRFTkFOVF9JRF9LRVksIEJSQU5DSF9JRF9LRVksIEZFQVRVUkVfRkxBR19LRVksIFNLSVBfUkFURV9MSU1JVF9LRVksIFJBVEVfTElNSVRfS0VZIH0gZnJvbSAnLi4vZGVjb3JhdG9ycyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBdXRoR3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgand0U2VydmljZTogSnd0U2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlZmxlY3RvcjogUmVmbGVjdG9yLFxuICApIHt9XG5cbiAgYXN5bmMgY2FuQWN0aXZhdGUoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGlzUHVibGljID0gdGhpcy5yZWZsZWN0b3IuZ2V0QWxsQW5kT3ZlcnJpZGU8Ym9vbGVhbj4oSVNfUFVCTElDX0tFWSwgW1xuICAgICAgY29udGV4dC5nZXRIYW5kbGVyKCksXG4gICAgICBjb250ZXh0LmdldENsYXNzKCksXG4gICAgXSk7XG5cbiAgICBpZiAoaXNQdWJsaWMpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3QgPSBjb250ZXh0LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuZXh0cmFjdFRva2VuRnJvbUhlYWRlcihyZXF1ZXN0KTtcblxuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIHRocm93IG5ldyBVbmF1dGhvcml6ZWRFeGNlcHRpb24oJ0F1dGhlbnRpY2F0aW9uIHRva2VuIGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCB0aGlzLmp3dFNlcnZpY2UudmVyaWZ5QXN5bmModG9rZW4pO1xuICAgICAgcmVxdWVzdC51c2VyID0gcGF5bG9hZDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBVbmF1dGhvcml6ZWRFeGNlcHRpb24oJ0ludmFsaWQgb3IgZXhwaXJlZCB0b2tlbicpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0VG9rZW5Gcm9tSGVhZGVyKHJlcXVlc3Q6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBhdXRoSGVhZGVyID0gcmVxdWVzdC5oZWFkZXJzPy5hdXRob3JpemF0aW9uO1xuICAgIGlmICghYXV0aEhlYWRlciB8fCB0eXBlb2YgYXV0aEhlYWRlciAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IFt0eXBlLCB0b2tlbl0gPSBhdXRoSGVhZGVyLnNwbGl0KCcgJyk7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdCZWFyZXInID8gdG9rZW4gOiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBlcm1pc3Npb25zR3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcmVmbGVjdG9yOiBSZWZsZWN0b3IpIHt9XG5cbiAgYXN5bmMgY2FuQWN0aXZhdGUoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlcXVpcmVkUGVybWlzc2lvbnMgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTxzdHJpbmdbXT4oUEVSTUlTU0lPTlNfS0VZLCBbXG4gICAgICBjb250ZXh0LmdldEhhbmRsZXIoKSxcbiAgICAgIGNvbnRleHQuZ2V0Q2xhc3MoKSxcbiAgICBdKTtcblxuICAgIGlmICghcmVxdWlyZWRQZXJtaXNzaW9ucyB8fCByZXF1aXJlZFBlcm1pc3Npb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWVzdCA9IGNvbnRleHQuc3dpdGNoVG9IdHRwKCkuZ2V0UmVxdWVzdCgpO1xuICAgIGNvbnN0IHVzZXIgPSByZXF1ZXN0LnVzZXI7XG5cbiAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGVybWlzc2lvbnMpIHtcbiAgICAgIHRocm93IG5ldyBGb3JiaWRkZW5FeGNlcHRpb24oJ0luc3VmZmljaWVudCBwZXJtaXNzaW9ucycpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc1Blcm1pc3Npb24gPSByZXF1aXJlZFBlcm1pc3Npb25zLnNvbWUocGVybWlzc2lvbiA9PlxuICAgICAgdXNlci5wZXJtaXNzaW9ucy5pbmNsdWRlcyhwZXJtaXNzaW9uKSB8fCB1c2VyLnBlcm1pc3Npb25zLmluY2x1ZGVzKCcqJyksXG4gICAgKTtcblxuICAgIGlmICghaGFzUGVybWlzc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEZvcmJpZGRlbkV4Y2VwdGlvbihgUmVxdWlyZWQgcGVybWlzc2lvbnM6ICR7cmVxdWlyZWRQZXJtaXNzaW9ucy5qb2luKCcsICcpfWApO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb2xlc0d1YXJkIGltcGxlbWVudHMgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHJlZmxlY3RvcjogUmVmbGVjdG9yKSB7fVxuXG4gIGFzeW5jIGNhbkFjdGl2YXRlKGNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZXF1aXJlZFJvbGVzID0gdGhpcy5yZWZsZWN0b3IuZ2V0QWxsQW5kT3ZlcnJpZGU8c3RyaW5nW10+KFJPTEVTX0tFWSwgW1xuICAgICAgY29udGV4dC5nZXRIYW5kbGVyKCksXG4gICAgICBjb250ZXh0LmdldENsYXNzKCksXG4gICAgXSk7XG5cbiAgICBpZiAoIXJlcXVpcmVkUm9sZXMgfHwgcmVxdWlyZWRSb2xlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3QgPSBjb250ZXh0LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICBjb25zdCB1c2VyID0gcmVxdWVzdC51c2VyO1xuXG4gICAgaWYgKCF1c2VyIHx8ICF1c2VyLnJvbGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRm9yYmlkZGVuRXhjZXB0aW9uKCdJbnN1ZmZpY2llbnQgcm9sZScpO1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXJSb2xlcyA9IEFycmF5LmlzQXJyYXkodXNlci5yb2xlcykgPyB1c2VyLnJvbGVzIDogW3VzZXIucm9sZXNdO1xuICAgIGNvbnN0IGhhc1JvbGUgPSByZXF1aXJlZFJvbGVzLnNvbWUocm9sZSA9PiB1c2VyUm9sZXMuaW5jbHVkZXMocm9sZSkpO1xuXG4gICAgaWYgKCFoYXNSb2xlKSB7XG4gICAgICB0aHJvdyBuZXcgRm9yYmlkZGVuRXhjZXB0aW9uKGBSZXF1aXJlZCByb2xlczogJHtyZXF1aXJlZFJvbGVzLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlbmFudEd1YXJkIGltcGxlbWVudHMgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHJlZmxlY3RvcjogUmVmbGVjdG9yKSB7fVxuXG4gIGFzeW5jIGNhbkFjdGl2YXRlKGNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZXF1ZXN0ID0gY29udGV4dC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCk7XG4gICAgY29uc3QgdXNlciA9IHJlcXVlc3QudXNlcjtcblxuICAgIGlmICghdXNlcikge1xuICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignVXNlciBub3QgYXV0aGVudGljYXRlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHRlbmFudElkID0gdGhpcy5yZWZsZWN0b3IuZ2V0QWxsQW5kT3ZlcnJpZGU8c3RyaW5nPihURU5BTlRfSURfS0VZLCBbXG4gICAgICBjb250ZXh0LmdldEhhbmRsZXIoKSxcbiAgICAgIGNvbnRleHQuZ2V0Q2xhc3MoKSxcbiAgICBdKTtcblxuICAgIGlmICh0ZW5hbnRJZCAmJiB1c2VyLnRlbmFudElkICE9PSB0ZW5hbnRJZCkge1xuICAgICAgdGhyb3cgbmV3IEZvcmJpZGRlbkV4Y2VwdGlvbignQWNjZXNzIGRlbmllZDogSW52YWxpZCB0ZW5hbnQnKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0LnRlbmFudElkID0gdXNlci50ZW5hbnRJZDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJhbmNoR3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcmVmbGVjdG9yOiBSZWZsZWN0b3IpIHt9XG5cbiAgYXN5bmMgY2FuQWN0aXZhdGUoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBjb250ZXh0LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICBjb25zdCB1c2VyID0gcmVxdWVzdC51c2VyO1xuXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdVc2VyIG5vdCBhdXRoZW50aWNhdGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgYnJhbmNoSWQgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTxzdHJpbmc+KEJSQU5DSF9JRF9LRVksIFtcbiAgICAgIGNvbnRleHQuZ2V0SGFuZGxlcigpLFxuICAgICAgY29udGV4dC5nZXRDbGFzcygpLFxuICAgIF0pO1xuXG4gICAgaWYgKGJyYW5jaElkICYmIHVzZXIuYnJhbmNoSWQgIT09IGJyYW5jaElkKSB7XG4gICAgICB0aHJvdyBuZXcgRm9yYmlkZGVuRXhjZXB0aW9uKCdBY2Nlc3MgZGVuaWVkOiBJbnZhbGlkIGJyYW5jaCcpO1xuICAgIH1cblxuICAgIHJlcXVlc3QuYnJhbmNoSWQgPSB1c2VyLmJyYW5jaElkO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBGZWF0dXJlRmxhZ0d1YXJkIGltcGxlbWVudHMgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlZmxlY3RvcjogUmVmbGVjdG9yLFxuICAgIC8vIHByaXZhdGUgcmVhZG9ubHkgZmVhdHVyZUZsYWdzU2VydmljZTogSUZlYXR1cmVGbGFnc1NlcnZpY2UsXG4gICkge31cblxuICBhc3luYyBjYW5BY3RpdmF0ZShjb250ZXh0OiBFeGVjdXRpb25Db250ZXh0KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZmxhZyA9IHRoaXMucmVmbGVjdG9yLmdldEFsbEFuZE92ZXJyaWRlPHN0cmluZz4oRkVBVFVSRV9GTEFHX0tFWSwgW1xuICAgICAgY29udGV4dC5nZXRIYW5kbGVyKCksXG4gICAgICBjb250ZXh0LmdldENsYXNzKCksXG4gICAgXSk7XG5cbiAgICBpZiAoIWZsYWcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGNvbnN0IGlzRW5hYmxlZCA9IGF3YWl0IHRoaXMuZmVhdHVyZUZsYWdzU2VydmljZS5pc0VuYWJsZWQoZmxhZyk7XG4gICAgLy8gaWYgKCFpc0VuYWJsZWQpIHtcbiAgICAvLyAgIHRocm93IG5ldyBGb3JiaWRkZW5FeGNlcHRpb24oYEZlYXR1cmUgJHtmbGFnfSBpcyBub3QgZW5hYmxlZGApO1xuICAgIC8vIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSYXRlTGltaXRHdWFyZCBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSByZWZsZWN0b3I6IFJlZmxlY3RvcixcbiAgICAvLyBwcml2YXRlIHJlYWRvbmx5IHJhdGVMaW1pdGluZ1NlcnZpY2U6IElSYXRlTGltaXRpbmdTZXJ2aWNlLFxuICApIHt9XG5cbiAgYXN5bmMgY2FuQWN0aXZhdGUoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHNraXBSYXRlTGltaXQgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTxib29sZWFuPihTS0lQX1JBVEVfTElNSVRfS0VZLCBbXG4gICAgICBjb250ZXh0LmdldEhhbmRsZXIoKSxcbiAgICAgIGNvbnRleHQuZ2V0Q2xhc3MoKSxcbiAgICBdKTtcblxuICAgIGlmIChza2lwUmF0ZUxpbWl0KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCByYXRlTGltaXRDb25maWcgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTx7IGxpbWl0OiBudW1iZXI7IHdpbmRvd01zOiBudW1iZXIgfT4oUkFURV9MSU1JVF9LRVksIFtcbiAgICAgIGNvbnRleHQuZ2V0SGFuZGxlcigpLFxuICAgICAgY29udGV4dC5nZXRDbGFzcygpLFxuICAgIF0pO1xuXG4gICAgaWYgKCFyYXRlTGltaXRDb25maWcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3QgPSBjb250ZXh0LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICBjb25zdCBrZXkgPSBgcmF0ZWxpbWl0OiR7cmVxdWVzdC5pcH06JHtyZXF1ZXN0LnJvdXRlPy5wYXRoIHx8IHJlcXVlc3QudXJsfWA7XG5cbiAgICAvLyBjb25zdCBsaW1pdEluZm8gPSBhd2FpdCB0aGlzLnJhdGVMaW1pdGluZ1NlcnZpY2UuaW5jcmVtZW50KGtleSwgcmF0ZUxpbWl0Q29uZmlnLndpbmRvd01zKTtcbiAgICAvLyBpZiAobGltaXRJbmZvLnJlbWFpbmluZyA8IDApIHtcbiAgICAvLyAgIHRocm93IG5ldyBUb29NYW55UmVxdWVzdHNFeGNlcHRpb24oJ1JhdGUgbGltaXQgZXhjZWVkZWQnKTtcbiAgICAvLyB9XG5cbiAgICAvLyByZXF1ZXN0LnJhdGVMaW1pdCA9IGxpbWl0SW5mbztcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufSJdfQ==