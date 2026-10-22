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
exports.BranchGuard = exports.TenantGuard = exports.MfaGuard = exports.RolesGuard = exports.PermissionsGuard = exports.LocalAuthGuard = exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const shared_1 = require("@cf-erp/shared");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    reflector;
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(shared_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JwtAuthGuard);
let LocalAuthGuard = class LocalAuthGuard extends (0, passport_1.AuthGuard)('local') {
};
exports.LocalAuthGuard = LocalAuthGuard;
exports.LocalAuthGuard = LocalAuthGuard = __decorate([
    (0, common_1.Injectable)()
], LocalAuthGuard);
let PermissionsGuard = class PermissionsGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(shared_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.permissions) {
            throw new common_1.UnauthorizedException('Insufficient permissions');
        }
        const hasPermission = requiredPermissions.some(permission => user.permissions.includes(permission) || user.permissions.includes('*'));
        if (!hasPermission) {
            throw new common_1.UnauthorizedException(`Required permissions: ${requiredPermissions.join(', ')}`);
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
        const requiredRoles = this.reflector.getAllAndOverride(shared_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.roles) {
            throw new common_1.UnauthorizedException('Insufficient role');
        }
        const hasRole = requiredRoles.some(role => user.roles.includes(role));
        if (!hasRole) {
            throw new common_1.UnauthorizedException(`Required roles: ${requiredRoles.join(', ')}`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
let MfaGuard = class MfaGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        if (user.mfaEnabled && !request.headers['x-mfa-code']) {
            throw new common_1.UnauthorizedException('MFA code required');
        }
        return true;
    }
};
exports.MfaGuard = MfaGuard;
exports.MfaGuard = MfaGuard = __decorate([
    (0, common_1.Injectable)()
], MfaGuard);
let TenantGuard = class TenantGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.tenantId) {
            throw new common_1.UnauthorizedException('Tenant context required');
        }
        request.tenantId = user.tenantId;
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)()
], TenantGuard);
let BranchGuard = class BranchGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.branchId) {
            throw new common_1.UnauthorizedException('Branch context required');
        }
        request.branchId = user.branchId;
        return true;
    }
};
exports.BranchGuard = BranchGuard;
exports.BranchGuard = BranchGuard = __decorate([
    (0, common_1.Injectable)()
], BranchGuard);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VhcmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ3VhcmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFrRztBQUNsRywrQ0FBNkM7QUFDN0MsdUNBQXlDO0FBQ3pDLDJDQUEyRTtBQUdwRSxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsSUFBQSxvQkFBUyxFQUFDLEtBQUssQ0FBQztJQUNuQjtJQUE3QixZQUE2QixTQUFvQjtRQUMvQyxLQUFLLEVBQUUsQ0FBQztRQURtQixjQUFTLEdBQVQsU0FBUyxDQUFXO0lBRWpELENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQXlCO1FBQ3pDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQVUsc0JBQWEsRUFBRTtZQUN4RSxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxRQUFRLEVBQUU7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQXFCLENBQUM7SUFDeEQsQ0FBQztDQUNGLENBQUE7QUFqQlksb0NBQVk7dUJBQVosWUFBWTtJQUR4QixJQUFBLG1CQUFVLEdBQUU7cUNBRTZCLGdCQUFTO0dBRHRDLFlBQVksQ0FpQnhCO0FBR00sSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLElBQUEsb0JBQVMsRUFBQyxPQUFPLENBQUM7Q0FBRyxDQUFBO0FBQTVDLHdDQUFjO3lCQUFkLGNBQWM7SUFEMUIsSUFBQSxtQkFBVSxHQUFFO0dBQ0EsY0FBYyxDQUE4QjtBQUdsRCxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtJQUNFO0lBQTdCLFlBQTZCLFNBQW9CO1FBQXBCLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFBRyxDQUFDO0lBRXJELEtB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TUFBTSxXQUFXO0lBQ3RCLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBeUI7UUFDekMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFFMUIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM1QixNQUFNLElBQUksOEJBQXFCLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2pDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGLENBQUE7QUFaWSxrQ0FBVztzQkFBWCxXQUFXO0lBRHZCLElBQUEsbUJBQVUsR0FBRTtHQUNBLFdBQVcsQ0FZdkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBDYW5BY3RpdmF0ZSwgRXhlY3V0aW9uQ29udGV4dCwgVW5hdXRob3JpemVkRXhjZXB0aW9uIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IHsgQXV0aEd1YXJkIH0gZnJvbSAnQG5lc3Rqcy9wYXNzcG9ydCc7XG5pbXBvcnQgeyBSZWZsZWN0b3IgfSBmcm9tICdAbmVzdGpzL2NvcmUnO1xuaW1wb3J0IHsgSVNfUFVCTElDX0tFWSwgUEVSTUlTU0lPTlNfS0VZLCBST0xFU19LRVkgfSBmcm9tICdAY2YtZXJwL3NoYXJlZCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKd3RBdXRoR3VhcmQgZXh0ZW5kcyBBdXRoR3VhcmQoJ2p3dCcpIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSByZWZsZWN0b3I6IFJlZmxlY3Rvcikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhc3luYyBjYW5BY3RpdmF0ZShjb250ZXh0OiBFeGVjdXRpb25Db250ZXh0KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaXNQdWJsaWMgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTxib29sZWFuPihJU19QVUJMSUNfS0VZLCBbXG4gICAgICBjb250ZXh0LmdldEhhbmRsZXIoKSxcbiAgICAgIGNvbnRleHQuZ2V0Q2xhc3MoKSxcbiAgICBdKTtcblxuICAgIGlmIChpc1B1YmxpYykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyLmNhbkFjdGl2YXRlKGNvbnRleHQpIGFzIFByb21pc2U8Ym9vbGVhbj47XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExvY2FsQXV0aEd1YXJkIGV4dGVuZHMgQXV0aEd1YXJkKCdsb2NhbCcpIHt9XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQZXJtaXNzaW9uc0d1YXJkIGltcGxlbWVudHMgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHJlZmxlY3RvcjogUmVmbGVjdG9yKSB7fVxuXG4gIGFzeW5jIGNhbkFjdGl2YXRlKGNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZXF1aXJlZFBlcm1pc3Npb25zID0gdGhpcy5yZWZsZWN0b3IuZ2V0QWxsQW5kT3ZlcnJpZGU8c3RyaW5nW10+KFBFUk1JU1NJT05TX0tFWSwgW1xuICAgICAgY29udGV4dC5nZXRIYW5kbGVyKCksXG4gICAgICBjb250ZXh0LmdldENsYXNzKCksXG4gICAgXSk7XG5cbiAgICBpZiAoIXJlcXVpcmVkUGVybWlzc2lvbnMgfHwgcmVxdWlyZWRQZXJtaXNzaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3QgPSBjb250ZXh0LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICBjb25zdCB1c2VyID0gcmVxdWVzdC51c2VyO1xuXG4gICAgaWYgKCF1c2VyIHx8ICF1c2VyLnBlcm1pc3Npb25zKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNQZXJtaXNzaW9uID0gcmVxdWlyZWRQZXJtaXNzaW9ucy5zb21lKHBlcm1pc3Npb24gPT5cbiAgICAgIHVzZXIucGVybWlzc2lvbnMuaW5jbHVkZXMocGVybWlzc2lvbikgfHwgdXNlci5wZXJtaXNzaW9ucy5pbmNsdWRlcygnKicpLFxuICAgICk7XG5cbiAgICBpZiAoIWhhc1Blcm1pc3Npb24pIHtcbiAgICAgIHRocm93IG5ldyBVbmF1dGhvcml6ZWRFeGNlcHRpb24oYFJlcXVpcmVkIHBlcm1pc3Npb25zOiAke3JlcXVpcmVkUGVybWlzc2lvbnMuam9pbignLCAnKX1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9sZXNHdWFyZCBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSByZWZsZWN0b3I6IFJlZmxlY3Rvcikge31cblxuICBhc3luYyBjYW5BY3RpdmF0ZShjb250ZXh0OiBFeGVjdXRpb25Db250ZXh0KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVxdWlyZWRSb2xlcyA9IHRoaXMucmVmbGVjdG9yLmdldEFsbEFuZE92ZXJyaWRlPHN0cmluZ1tdPihST0xFU19LRVksIFtcbiAgICAgIGNvbnRleHQuZ2V0SGFuZGxlcigpLFxuICAgICAgY29udGV4dC5nZXRDbGFzcygpLFxuICAgIF0pO1xuXG4gICAgaWYgKCFyZXF1aXJlZFJvbGVzIHx8IHJlcXVpcmVkUm9sZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCByZXF1ZXN0ID0gY29udGV4dC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCk7XG4gICAgY29uc3QgdXNlciA9IHJlcXVlc3QudXNlcjtcblxuICAgIGlmICghdXNlciB8fCAhdXNlci5yb2xlcykge1xuICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignSW5zdWZmaWNpZW50IHJvbGUnKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNSb2xlID0gcmVxdWlyZWRSb2xlcy5zb21lKHJvbGUgPT4gdXNlci5yb2xlcy5pbmNsdWRlcyhyb2xlKSk7XG5cbiAgICBpZiAoIWhhc1JvbGUpIHtcbiAgICAgIHRocm93IG5ldyBVbmF1dGhvcml6ZWRFeGNlcHRpb24oYFJlcXVpcmVkIHJvbGVzOiAke3JlcXVpcmVkUm9sZXMuam9pbignLCAnKX1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWZhR3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG4gIGFzeW5jIGNhbkFjdGl2YXRlKGNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZXF1ZXN0ID0gY29udGV4dC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCk7XG4gICAgY29uc3QgdXNlciA9IHJlcXVlc3QudXNlcjtcblxuICAgIGlmICghdXNlcikge1xuICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignVXNlciBub3QgYXV0aGVudGljYXRlZCcpO1xuICAgIH1cblxuICAgIGlmICh1c2VyLm1mYUVuYWJsZWQgJiYgIXJlcXVlc3QuaGVhZGVyc1sneC1tZmEtY29kZSddKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdNRkEgY29kZSByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZW5hbnRHdWFyZCBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcbiAgYXN5bmMgY2FuQWN0aXZhdGUoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBjb250ZXh0LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICBjb25zdCB1c2VyID0gcmVxdWVzdC51c2VyO1xuXG4gICAgaWYgKCF1c2VyIHx8ICF1c2VyLnRlbmFudElkKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdUZW5hbnQgY29udGV4dCByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIHJlcXVlc3QudGVuYW50SWQgPSB1c2VyLnRlbmFudElkO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcmFuY2hHdWFyZCBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcbiAgYXN5bmMgY2FuQWN0aXZhdGUoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBjb250ZXh0LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICBjb25zdCB1c2VyID0gcmVxdWVzdC51c2VyO1xuXG4gICAgaWYgKCF1c2VyIHx8ICF1c2VyLmJyYW5jaElkKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdCcmFuY2ggY29udGV4dCByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIHJlcXVlc3QuYnJhbmNoSWQgPSB1c2VyLmJyYW5jaElkO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59Il19