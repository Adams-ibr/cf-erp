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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@cf-erp/config");
const database_1 = require("@cf-erp/database");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config_1.env.jwt.secret,
            issuer: config_1.env.jwt.issuer,
            audience: config_1.env.jwt.audience,
        });
    }
    async validate(payload) {
        const user = await database_1.prisma.user.findUnique({
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
            throw new common_1.UnauthorizedException('User not found or deactivated');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        const permissions = user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission.code));
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
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtStrategy);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiand0LnN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiand0LnN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFtRTtBQUNuRSwrQ0FBb0Q7QUFDcEQsK0NBQW9EO0FBQ3BELDJDQUFxQztBQUNyQywrQ0FBMEM7QUFHbkMsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLElBQUEsMkJBQWdCLEVBQUMsdUJBQVEsRUFBRSxLQUFLLENBQUM7SUFDaEU7UUFDRSxLQUFLLENBQUM7WUFDSixjQUFjLEVBQUUseUJBQVUsQ0FBQywyQkFBMkIsRUFBRTtZQUN4RCxnQkFBZ0IsRUFBRSxLQUFLO1lBQ3ZCLFdBQVcsRUFBRSxZQUFHLENBQUMsR0FBRyxDQUFDLE1BQU07WUFDM0IsTUFBTSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTTtZQUN0QixRQUFRLEVBQUUsWUFBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRO1NBQzNCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQW1CO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLE1BQU0saUJBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3hDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFO1lBQzFCLE9BQU8sRUFBRTtnQkFDUCxLQUFLLEVBQUU7b0JBQ0wsT0FBTyxFQUFFO3dCQUNQLElBQUksRUFBRTs0QkFDSixPQUFPLEVBQUU7Z0NBQ1AsV0FBVyxFQUFFO29DQUNYLE9BQU8sRUFBRTt3Q0FDUCxVQUFVLEVBQUUsSUFBSTtxQ0FDakI7aUNBQ0Y7NkJBQ0Y7eUJBQ0Y7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsTUFBTSxFQUFFLElBQUk7YUFDYjtTQUNGLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzVCLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25CLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUMxQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUNsRCxDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpELE9BQU87WUFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLEtBQUs7WUFDTCxXQUFXO1lBQ1gsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1NBQzVCLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQTtBQTNEWSxrQ0FBVztzQkFBWCxXQUFXO0lBRHZCLElBQUEsbUJBQVUsR0FBRTs7R0FDQSxXQUFXLENBMkR2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIFVuYXV0aG9yaXplZEV4Y2VwdGlvbiB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IFBhc3Nwb3J0U3RyYXRlZ3kgfSBmcm9tICdAbmVzdGpzL3Bhc3Nwb3J0JztcbmltcG9ydCB7IEV4dHJhY3RKd3QsIFN0cmF0ZWd5IH0gZnJvbSAncGFzc3BvcnQtand0JztcbmltcG9ydCB7IGVudiB9IGZyb20gJ0BjZi1lcnAvY29uZmlnJztcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0BjZi1lcnAvZGF0YWJhc2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnd0U3RyYXRlZ3kgZXh0ZW5kcyBQYXNzcG9ydFN0cmF0ZWd5KFN0cmF0ZWd5LCAnand0Jykge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7XG4gICAgICBqd3RGcm9tUmVxdWVzdDogRXh0cmFjdEp3dC5mcm9tQXV0aEhlYWRlckFzQmVhcmVyVG9rZW4oKSxcbiAgICAgIGlnbm9yZUV4cGlyYXRpb246IGZhbHNlLFxuICAgICAgc2VjcmV0T3JLZXk6IGVudi5qd3Quc2VjcmV0LFxuICAgICAgaXNzdWVyOiBlbnYuand0Lmlzc3VlcixcbiAgICAgIGF1ZGllbmNlOiBlbnYuand0LmF1ZGllbmNlLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgdmFsaWRhdGUocGF5bG9hZDogSnd0UGF5bG9hZCk6IFByb21pc2U8Snd0VXNlcj4ge1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgIHdoZXJlOiB7IGlkOiBwYXlsb2FkLnN1YiB9LFxuICAgICAgaW5jbHVkZToge1xuICAgICAgICByb2xlczoge1xuICAgICAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgICAgIHJvbGU6IHtcbiAgICAgICAgICAgICAgaW5jbHVkZToge1xuICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiB7XG4gICAgICAgICAgICAgICAgICBpbmNsdWRlOiB7XG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246IHRydWUsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGJyYW5jaGVzOiB0cnVlLFxuICAgICAgICB0ZW5hbnQ6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgaWYgKCF1c2VyIHx8IHVzZXIuaXNEZWxldGVkKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdVc2VyIG5vdCBmb3VuZCBvciBkZWFjdGl2YXRlZCcpO1xuICAgIH1cblxuICAgIGlmICghdXNlci5pc0FjdGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignVXNlciBhY2NvdW50IGlzIGluYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGVybWlzc2lvbnMgPSB1c2VyLnJvbGVzLmZsYXRNYXAodXIgPT5cbiAgICAgIHVyLnJvbGUucGVybWlzc2lvbnMubWFwKHJwID0+IHJwLnBlcm1pc3Npb24uY29kZSksXG4gICAgKTtcblxuICAgIGNvbnN0IHJvbGVzID0gdXNlci5yb2xlcy5tYXAodXIgPT4gdXIucm9sZS5jb2RlKTtcblxuICAgIHJldHVybiB7XG4gICAgICBpZDogdXNlci5pZCxcbiAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgZmlyc3ROYW1lOiB1c2VyLmZpcnN0TmFtZSxcbiAgICAgIGxhc3ROYW1lOiB1c2VyLmxhc3ROYW1lLFxuICAgICAgdGVuYW50SWQ6IHVzZXIudGVuYW50SWQsXG4gICAgICBicmFuY2hJZDogdXNlci5icmFuY2hJZCxcbiAgICAgIHJvbGVzLFxuICAgICAgcGVybWlzc2lvbnMsXG4gICAgICBtZmFFbmFibGVkOiB1c2VyLm1mYUVuYWJsZWQsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEp3dFBheWxvYWQge1xuICBzdWI6IHN0cmluZztcbiAgZW1haWw6IHN0cmluZztcbiAgdGVuYW50SWQ6IHN0cmluZztcbiAgYnJhbmNoSWQ/OiBzdHJpbmc7XG4gIHJvbGVzOiBzdHJpbmdbXTtcbiAgcGVybWlzc2lvbnM6IHN0cmluZ1tdO1xuICBpYXQ6IG51bWJlcjtcbiAgZXhwOiBudW1iZXI7XG4gIGlzczogc3RyaW5nO1xuICBhdWQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKd3RVc2VyIHtcbiAgaWQ6IHN0cmluZztcbiAgZW1haWw6IHN0cmluZztcbiAgZmlyc3ROYW1lOiBzdHJpbmc7XG4gIGxhc3ROYW1lOiBzdHJpbmc7XG4gIHRlbmFudElkOiBzdHJpbmc7XG4gIGJyYW5jaElkPzogc3RyaW5nO1xuICByb2xlczogc3RyaW5nW107XG4gIHBlcm1pc3Npb25zOiBzdHJpbmdbXTtcbiAgbWZhRW5hYmxlZDogYm9vbGVhbjtcbn0iXX0=