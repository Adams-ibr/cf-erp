"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("@cf-erp/config");
const database_1 = require("@cf-erp/database");
let AuthService = class AuthService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await database_1.prisma.user.findUnique({
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
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            await this.recordFailedLogin(user.id);
            return null;
        }
        await this.recordSuccessfulLogin(user.id);
        const permissions = user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission.code));
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
    async login(user) {
        const payload = this.createPayload(user);
        const accessToken = this.jwtService.sign(payload, {
            secret: config_1.env.jwt.secret,
            expiresIn: config_1.env.jwt.expiresIn,
            issuer: config_1.env.jwt.issuer,
            audience: config_1.env.jwt.audience,
        });
        const refreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' }, {
            secret: config_1.env.jwt.refreshSecret,
            expiresIn: config_1.env.jwt.refreshExpiresIn,
            issuer: config_1.env.jwt.issuer,
            audience: config_1.env.jwt.audience,
        });
        await this.storeRefreshToken(user.id, refreshToken);
        return {
            accessToken,
            refreshToken,
            expiresIn: this.parseExpiry(config_1.env.jwt.expiresIn),
            tokenType: 'Bearer',
        };
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: config_1.env.jwt.refreshSecret,
                issuer: config_1.env.jwt.issuer,
                audience: config_1.env.jwt.audience,
            });
            if (payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid token type');
            }
            const storedToken = await database_1.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });
            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Refresh token expired or revoked');
            }
            const user = storedToken.user;
            if (!user.isActive || user.isDeleted) {
                throw new common_1.UnauthorizedException('User account is inactive');
            }
            await database_1.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            const jwtUser = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                tenantId: user.tenantId,
                branchId: user.branchId || undefined,
                roles: user.roles.map(ur => ur.role.code),
                permissions: user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission.code)),
                mfaEnabled: user.mfaEnabled,
            };
            return this.login(jwtUser);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await database_1.prisma.refreshToken.deleteMany({
                where: { userId, token: refreshToken },
            });
        }
        else {
            await database_1.prisma.refreshToken.deleteMany({ where: { userId } });
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword },
        });
        await database_1.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    async resetPassword(email, newPassword, token) {
        const resetToken = await database_1.prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetToken || resetToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        if (resetToken.user.email !== email) {
            throw new common_1.UnauthorizedException('Invalid reset token');
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await database_1.prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash: hashedPassword },
        });
        await database_1.prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
        await database_1.prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } });
    }
    async requestPasswordReset(email) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return;
        }
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await database_1.prisma.passwordResetToken.create({
            data: { userId: user.id, token, expiresAt },
        });
        // Send email with reset link
        // await this.emailService.sendPasswordReset(user.email, token);
    }
    async register(data) {
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await this.hashPassword(data.password);
        const user = await database_1.prisma.user.create({
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
        const permissions = user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission.code));
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
    async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }
    createPayload(user) {
        return {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            branchId: user.branchId,
            roles: user.roles,
            permissions: user.permissions,
        };
    }
    parseExpiry(expiry) {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match)
            return 86400;
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
    async storeRefreshToken(userId, token) {
        const expiresAt = new Date(Date.now() + this.parseExpiry(config_1.env.jwt.refreshExpiresIn) * 1000);
        await database_1.prisma.refreshToken.create({
            data: { userId, token, expiresAt },
        });
    }
    async recordFailedLogin(userId) {
        await database_1.prisma.loginAttempt.create({
            data: { userId, success: false, ipAddress: 'unknown', userAgent: 'unknown' },
        });
    }
    async recordSuccessfulLogin(userId) {
        await database_1.prisma.loginAttempt.create({
            data: { userId, success: true, ipAddress: 'unknown', userAgent: 'unknown' },
        });
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXV0aC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFzRjtBQUN0RixxQ0FBeUM7QUFDekMsK0NBQWlDO0FBQ2pDLDJDQUFxQztBQUNyQywrQ0FBMEM7QUFJbkMsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBVztJQUNPO0lBQTdCLFlBQTZCLFVBQXNCO1FBQXRCLGVBQVUsR0FBVixVQUFVLENBQVk7SUFBRyxDQUFDO0lBRXZELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYSxFQUFFLFFBQWdCO1FBQ2hELE1BQU0sSUFBSSxHQUFHLE1BQU0saUJBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3hDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDckMsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRTtvQkFDTCxPQUFPLEVBQUU7d0JBQ1AsSUFBSSxFQUFFOzRCQUNKLE9BQU8sRUFBRTtnQ0FDUCxXQUFXLEVBQUU7b0NBQ1gsT0FBTyxFQUFFO3dDQUNQLFVBQVUsRUFBRSxJQUFJO3FDQUNqQjtpQ0FDRjs2QkFDRjt5QkFDRjtxQkFDRjtpQkFDRjtnQkFDRCxNQUFNLEVBQUUsSUFBSTthQUNiO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDNUIsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixNQUFNLElBQUksOEJBQXFCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsTUFBTSxlQUFlLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFMUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FDMUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FDbEQsQ0FBQztRQUVGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqRCxPQUFPO1lBQ0wsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ1gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLFNBQVM7WUFDcEMsS0FBSztZQUNMLFdBQVc7WUFDWCxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDNUIsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLElBQWE7UUFDdkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEQsTUFBTSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTTtZQUN0QixTQUFTLEVBQUUsWUFBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTO1lBQzVCLE1BQU0sRUFBRSxZQUFHLENBQUMsR0FBRyxDQUFDLE1BQU07WUFDdEIsUUFBUSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUTtTQUMzQixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FDdkMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQ2pDO1lBQ0UsTUFBTSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYTtZQUM3QixTQUFTLEVBQUUsWUFBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7WUFDbkMsTUFBTSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTTtZQUN0QixRQUFRLEVBQUUsWUFBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRO1NBQzNCLENBQ0YsQ0FBQztRQUVGLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFcEQsT0FBTztZQUNMLFdBQVc7WUFDWCxZQUFZO1lBQ1osU0FBUyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFDOUMsU0FBUyxFQUFFLFFBQVE7U0FDcEIsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQW9CO1FBQ3RDLElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRTtnQkFDbkQsTUFBTSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYTtnQkFDN0IsTUFBTSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTTtnQkFDdEIsUUFBUSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUTthQUMzQixDQUFDLENBQUM7WUFFSCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3hELENBQUM7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLGlCQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztnQkFDdkQsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRTtnQkFDOUIsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTthQUN4QixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUN2RCxNQUFNLElBQUksOEJBQXFCLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUN0RSxDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzlELENBQUM7WUFFRCxNQUFNLGlCQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXBFLE1BQU0sT0FBTyxHQUFZO2dCQUN2QixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTO2dCQUNwQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDekMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQ25DLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQ2xEO2dCQUNELFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTthQUM1QixDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsSUFBSSxLQUFLLFlBQVksOEJBQXFCO2dCQUFFLE1BQU0sS0FBSyxDQUFDO1lBQ3hELE1BQU0sSUFBSSw4QkFBcUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQzNELENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFjLEVBQUUsWUFBcUI7UUFDaEQsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixNQUFNLGlCQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztnQkFDbkMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUU7YUFDdkMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLGlCQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBYyxFQUFFLGVBQXVCLEVBQUUsV0FBbUI7UUFDL0UsTUFBTSxJQUFJLEdBQUcsTUFBTSxpQkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNWLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksOEJBQXFCLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVELE1BQU0saUJBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3ZCLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUU7WUFDckIsSUFBSSxFQUFFLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRTtTQUN2QyxDQUFDLENBQUM7UUFFSCxNQUFNLGlCQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFhLEVBQUUsV0FBbUIsRUFBRSxLQUFhO1FBQ25FLE1BQU0sVUFBVSxHQUFHLE1BQU0saUJBQU0sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUM7WUFDNUQsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFO1lBQ2hCLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNyRCxNQUFNLElBQUksOEJBQXFCLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRUQsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNwQyxNQUFNLElBQUksOEJBQXFCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVELE1BQU0saUJBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3ZCLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQ2hDLElBQUksRUFBRSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUU7U0FDdkMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxpQkFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0saUJBQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFhO1FBQ3RDLE1BQU0sSUFBSSxHQUFHLE1BQU0saUJBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3hDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUU7U0FDdEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBRWxFLE1BQU0saUJBQU0sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7WUFDckMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtTQUM1QyxDQUFDLENBQUM7UUFFSCw2QkFBNkI7UUFDN0IsZ0VBQWdFO0lBQ2xFLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLElBQW1CO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLE1BQU0saUJBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2hELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFO1NBQzNDLENBQUMsQ0FBQztRQUVILElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsTUFBTSxJQUFJLDBCQUFpQixDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFOUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxpQkFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDcEMsSUFBSSxFQUFFO2dCQUNKLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtnQkFDL0IsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLFlBQVksRUFBRSxjQUFjO2dCQUM1QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdkIsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFO29CQUNMLE9BQU8sRUFBRTt3QkFDUCxJQUFJLEVBQUU7NEJBQ0osT0FBTyxFQUFFO2dDQUNQLFdBQVcsRUFBRTtvQ0FDWCxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO2lDQUM5Qjs2QkFDRjt5QkFDRjtxQkFDRjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FDMUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FDbEQsQ0FBQztRQUVGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqRCxPQUFPO1lBQ0wsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ1gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLFNBQVM7WUFDcEMsS0FBSztZQUNMLFdBQVc7WUFDWCxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDNUIsQ0FBQztJQUNKLENBQUM7SUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLFFBQWdCO1FBQ3pDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVPLGFBQWEsQ0FBQyxJQUFhO1FBQ2pDLE9BQU87WUFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1NBQzlCLENBQUM7SUFDSixDQUFDO0lBRU8sV0FBVyxDQUFDLE1BQWM7UUFDaEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFekIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdEIsUUFBUSxJQUFJLEVBQUUsQ0FBQztZQUNiLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUM7WUFDdkIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDNUIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDOUIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDL0IsT0FBTyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUM7UUFDeEIsQ0FBQztJQUNILENBQUM7SUFFTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBYyxFQUFFLEtBQWE7UUFDM0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzNGLE1BQU0saUJBQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQy9CLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO1NBQ25DLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBYztRQUM1QyxNQUFNLGlCQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUMvQixJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUU7U0FDN0UsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxNQUFjO1FBQ2hELE1BQU0saUJBQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQy9CLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTtTQUM1RSxDQUFDLENBQUM7UUFDSCxNQUFNLGlCQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN2QixLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFO1lBQ3JCLElBQUksRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFO1NBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRixDQUFBO0FBaFVZLGtDQUFXO3NCQUFYLFdBQVc7SUFEdkIsSUFBQSxtQkFBVSxHQUFFO3FDQUU4QixnQkFBVTtHQUR4QyxXQUFXLENBZ1V2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIFVuYXV0aG9yaXplZEV4Y2VwdGlvbiwgQ29uZmxpY3RFeGNlcHRpb24gfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBKd3RTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9qd3QnO1xuaW1wb3J0ICogYXMgYmNyeXB0IGZyb20gJ2JjcnlwdCc7XG5pbXBvcnQgeyBlbnYgfSBmcm9tICdAY2YtZXJwL2NvbmZpZyc7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAY2YtZXJwL2RhdGFiYXNlJztcbmltcG9ydCB7IEp3dFVzZXIgfSBmcm9tICcuL2p3dC5zdHJhdGVneSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBdXRoU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgand0U2VydmljZTogSnd0U2VydmljZSkge31cblxuICBhc3luYyB2YWxpZGF0ZVVzZXIoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8Snd0VXNlciB8IG51bGw+IHtcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICB3aGVyZTogeyBlbWFpbDogZW1haWwudG9Mb3dlckNhc2UoKSB9LFxuICAgICAgaW5jbHVkZToge1xuICAgICAgICByb2xlczoge1xuICAgICAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgICAgIHJvbGU6IHtcbiAgICAgICAgICAgICAgaW5jbHVkZToge1xuICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiB7XG4gICAgICAgICAgICAgICAgICBpbmNsdWRlOiB7XG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246IHRydWUsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHRlbmFudDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIXVzZXIgfHwgdXNlci5pc0RlbGV0ZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghdXNlci5pc0FjdGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignQWNjb3VudCBpcyBkZWFjdGl2YXRlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkSGFzaCk7XG4gICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucmVjb3JkRmFpbGVkTG9naW4odXNlci5pZCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnJlY29yZFN1Y2Nlc3NmdWxMb2dpbih1c2VyLmlkKTtcblxuICAgIGNvbnN0IHBlcm1pc3Npb25zID0gdXNlci5yb2xlcy5mbGF0TWFwKHVyID0+XG4gICAgICB1ci5yb2xlLnBlcm1pc3Npb25zLm1hcChycCA9PiBycC5wZXJtaXNzaW9uLmNvZGUpLFxuICAgICk7XG5cbiAgICBjb25zdCByb2xlcyA9IHVzZXIucm9sZXMubWFwKHVyID0+IHVyLnJvbGUuY29kZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgIGZpcnN0TmFtZTogdXNlci5maXJzdE5hbWUsXG4gICAgICBsYXN0TmFtZTogdXNlci5sYXN0TmFtZSxcbiAgICAgIHRlbmFudElkOiB1c2VyLnRlbmFudElkLFxuICAgICAgYnJhbmNoSWQ6IHVzZXIuYnJhbmNoSWQgfHwgdW5kZWZpbmVkLFxuICAgICAgcm9sZXMsXG4gICAgICBwZXJtaXNzaW9ucyxcbiAgICAgIG1mYUVuYWJsZWQ6IHVzZXIubWZhRW5hYmxlZCxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgbG9naW4odXNlcjogSnd0VXNlcik6IFByb21pc2U8QXV0aFRva2Vucz4ge1xuICAgIGNvbnN0IHBheWxvYWQgPSB0aGlzLmNyZWF0ZVBheWxvYWQodXNlcik7XG4gICAgY29uc3QgYWNjZXNzVG9rZW4gPSB0aGlzLmp3dFNlcnZpY2Uuc2lnbihwYXlsb2FkLCB7XG4gICAgICBzZWNyZXQ6IGVudi5qd3Quc2VjcmV0LFxuICAgICAgZXhwaXJlc0luOiBlbnYuand0LmV4cGlyZXNJbixcbiAgICAgIGlzc3VlcjogZW52Lmp3dC5pc3N1ZXIsXG4gICAgICBhdWRpZW5jZTogZW52Lmp3dC5hdWRpZW5jZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlZnJlc2hUb2tlbiA9IHRoaXMuand0U2VydmljZS5zaWduKFxuICAgICAgeyBzdWI6IHVzZXIuaWQsIHR5cGU6ICdyZWZyZXNoJyB9LFxuICAgICAge1xuICAgICAgICBzZWNyZXQ6IGVudi5qd3QucmVmcmVzaFNlY3JldCxcbiAgICAgICAgZXhwaXJlc0luOiBlbnYuand0LnJlZnJlc2hFeHBpcmVzSW4sXG4gICAgICAgIGlzc3VlcjogZW52Lmp3dC5pc3N1ZXIsXG4gICAgICAgIGF1ZGllbmNlOiBlbnYuand0LmF1ZGllbmNlLFxuICAgICAgfSxcbiAgICApO1xuXG4gICAgYXdhaXQgdGhpcy5zdG9yZVJlZnJlc2hUb2tlbih1c2VyLmlkLCByZWZyZXNoVG9rZW4pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFjY2Vzc1Rva2VuLFxuICAgICAgcmVmcmVzaFRva2VuLFxuICAgICAgZXhwaXJlc0luOiB0aGlzLnBhcnNlRXhwaXJ5KGVudi5qd3QuZXhwaXJlc0luKSxcbiAgICAgIHRva2VuVHlwZTogJ0JlYXJlcicsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHJlZnJlc2hUb2tlbnMocmVmcmVzaFRva2VuOiBzdHJpbmcpOiBQcm9taXNlPEF1dGhUb2tlbnM+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGF5bG9hZCA9IHRoaXMuand0U2VydmljZS52ZXJpZnkocmVmcmVzaFRva2VuLCB7XG4gICAgICAgIHNlY3JldDogZW52Lmp3dC5yZWZyZXNoU2VjcmV0LFxuICAgICAgICBpc3N1ZXI6IGVudi5qd3QuaXNzdWVyLFxuICAgICAgICBhdWRpZW5jZTogZW52Lmp3dC5hdWRpZW5jZSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGF5bG9hZC50eXBlICE9PSAncmVmcmVzaCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignSW52YWxpZCB0b2tlbiB0eXBlJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN0b3JlZFRva2VuID0gYXdhaXQgcHJpc21hLnJlZnJlc2hUb2tlbi5maW5kVW5pcXVlKHtcbiAgICAgICAgd2hlcmU6IHsgdG9rZW46IHJlZnJlc2hUb2tlbiB9LFxuICAgICAgICBpbmNsdWRlOiB7IHVzZXI6IHRydWUgfSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXN0b3JlZFRva2VuIHx8IHN0b3JlZFRva2VuLmV4cGlyZXNBdCA8IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignUmVmcmVzaCB0b2tlbiBleHBpcmVkIG9yIHJldm9rZWQnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdXNlciA9IHN0b3JlZFRva2VuLnVzZXI7XG4gICAgICBpZiAoIXVzZXIuaXNBY3RpdmUgfHwgdXNlci5pc0RlbGV0ZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignVXNlciBhY2NvdW50IGlzIGluYWN0aXZlJyk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHByaXNtYS5yZWZyZXNoVG9rZW4uZGVsZXRlKHsgd2hlcmU6IHsgaWQ6IHN0b3JlZFRva2VuLmlkIH0gfSk7XG5cbiAgICAgIGNvbnN0IGp3dFVzZXI6IEp3dFVzZXIgPSB7XG4gICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgZmlyc3ROYW1lOiB1c2VyLmZpcnN0TmFtZSxcbiAgICAgICAgbGFzdE5hbWU6IHVzZXIubGFzdE5hbWUsXG4gICAgICAgIHRlbmFudElkOiB1c2VyLnRlbmFudElkLFxuICAgICAgICBicmFuY2hJZDogdXNlci5icmFuY2hJZCB8fCB1bmRlZmluZWQsXG4gICAgICAgIHJvbGVzOiB1c2VyLnJvbGVzLm1hcCh1ciA9PiB1ci5yb2xlLmNvZGUpLFxuICAgICAgICBwZXJtaXNzaW9uczogdXNlci5yb2xlcy5mbGF0TWFwKHVyID0+XG4gICAgICAgICAgdXIucm9sZS5wZXJtaXNzaW9ucy5tYXAocnAgPT4gcnAucGVybWlzc2lvbi5jb2RlKSxcbiAgICAgICAgKSxcbiAgICAgICAgbWZhRW5hYmxlZDogdXNlci5tZmFFbmFibGVkLFxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHRoaXMubG9naW4oand0VXNlcik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFVuYXV0aG9yaXplZEV4Y2VwdGlvbikgdGhyb3cgZXJyb3I7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdJbnZhbGlkIHJlZnJlc2ggdG9rZW4nKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2dvdXQodXNlcklkOiBzdHJpbmcsIHJlZnJlc2hUb2tlbj86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChyZWZyZXNoVG9rZW4pIHtcbiAgICAgIGF3YWl0IHByaXNtYS5yZWZyZXNoVG9rZW4uZGVsZXRlTWFueSh7XG4gICAgICAgIHdoZXJlOiB7IHVzZXJJZCwgdG9rZW46IHJlZnJlc2hUb2tlbiB9LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHByaXNtYS5yZWZyZXNoVG9rZW4uZGVsZXRlTWFueSh7IHdoZXJlOiB7IHVzZXJJZCB9IH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoYW5nZVBhc3N3b3JkKHVzZXJJZDogc3RyaW5nLCBjdXJyZW50UGFzc3dvcmQ6IHN0cmluZywgbmV3UGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHsgd2hlcmU6IHsgaWQ6IHVzZXJJZCB9IH0pO1xuICAgIGlmICghdXNlcikge1xuICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignVXNlciBub3QgZm91bmQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoY3VycmVudFBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkSGFzaCk7XG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdDdXJyZW50IHBhc3N3b3JkIGlzIGluY29ycmVjdCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgdGhpcy5oYXNoUGFzc3dvcmQobmV3UGFzc3dvcmQpO1xuICAgIGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XG4gICAgICB3aGVyZTogeyBpZDogdXNlcklkIH0sXG4gICAgICBkYXRhOiB7IHBhc3N3b3JkSGFzaDogaGFzaGVkUGFzc3dvcmQgfSxcbiAgICB9KTtcblxuICAgIGF3YWl0IHByaXNtYS5yZWZyZXNoVG9rZW4uZGVsZXRlTWFueSh7IHdoZXJlOiB7IHVzZXJJZCB9IH0pO1xuICB9XG5cbiAgYXN5bmMgcmVzZXRQYXNzd29yZChlbWFpbDogc3RyaW5nLCBuZXdQYXNzd29yZDogc3RyaW5nLCB0b2tlbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVzZXRUb2tlbiA9IGF3YWl0IHByaXNtYS5wYXNzd29yZFJlc2V0VG9rZW4uZmluZFVuaXF1ZSh7XG4gICAgICB3aGVyZTogeyB0b2tlbiB9LFxuICAgICAgaW5jbHVkZTogeyB1c2VyOiB0cnVlIH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc2V0VG9rZW4gfHwgcmVzZXRUb2tlbi5leHBpcmVzQXQgPCBuZXcgRGF0ZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgVW5hdXRob3JpemVkRXhjZXB0aW9uKCdJbnZhbGlkIG9yIGV4cGlyZWQgcmVzZXQgdG9rZW4nKTtcbiAgICB9XG5cbiAgICBpZiAocmVzZXRUb2tlbi51c2VyLmVtYWlsICE9PSBlbWFpbCkge1xuICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZEV4Y2VwdGlvbignSW52YWxpZCByZXNldCB0b2tlbicpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc2hlZFBhc3N3b3JkID0gYXdhaXQgdGhpcy5oYXNoUGFzc3dvcmQobmV3UGFzc3dvcmQpO1xuICAgIGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XG4gICAgICB3aGVyZTogeyBpZDogcmVzZXRUb2tlbi51c2VySWQgfSxcbiAgICAgIGRhdGE6IHsgcGFzc3dvcmRIYXNoOiBoYXNoZWRQYXNzd29yZCB9LFxuICAgIH0pO1xuXG4gICAgYXdhaXQgcHJpc21hLnBhc3N3b3JkUmVzZXRUb2tlbi5kZWxldGUoeyB3aGVyZTogeyBpZDogcmVzZXRUb2tlbi5pZCB9IH0pO1xuICAgIGF3YWl0IHByaXNtYS5yZWZyZXNoVG9rZW4uZGVsZXRlTWFueSh7IHdoZXJlOiB7IHVzZXJJZDogcmVzZXRUb2tlbi51c2VySWQgfSB9KTtcbiAgfVxuXG4gIGFzeW5jIHJlcXVlc3RQYXNzd29yZFJlc2V0KGVtYWlsOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICB3aGVyZTogeyBlbWFpbDogZW1haWwudG9Mb3dlckNhc2UoKSB9LFxuICAgIH0pO1xuXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdG9rZW4gPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgIGNvbnN0IGV4cGlyZXNBdCA9IG5ldyBEYXRlKERhdGUubm93KCkgKyA2MCAqIDYwICogMTAwMCk7IC8vIDEgaG91clxuXG4gICAgYXdhaXQgcHJpc21hLnBhc3N3b3JkUmVzZXRUb2tlbi5jcmVhdGUoe1xuICAgICAgZGF0YTogeyB1c2VySWQ6IHVzZXIuaWQsIHRva2VuLCBleHBpcmVzQXQgfSxcbiAgICB9KTtcblxuICAgIC8vIFNlbmQgZW1haWwgd2l0aCByZXNldCBsaW5rXG4gICAgLy8gYXdhaXQgdGhpcy5lbWFpbFNlcnZpY2Uuc2VuZFBhc3N3b3JkUmVzZXQodXNlci5lbWFpbCwgdG9rZW4pO1xuICB9XG5cbiAgYXN5bmMgcmVnaXN0ZXIoZGF0YTogUmVnaXN0ZXJJbnB1dCk6IFByb21pc2U8Snd0VXNlcj4ge1xuICAgIGNvbnN0IGV4aXN0aW5nVXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgZW1haWw6IGRhdGEuZW1haWwudG9Mb3dlckNhc2UoKSB9LFxuICAgIH0pO1xuXG4gICAgaWYgKGV4aXN0aW5nVXNlcikge1xuICAgICAgdGhyb3cgbmV3IENvbmZsaWN0RXhjZXB0aW9uKCdFbWFpbCBhbHJlYWR5IHJlZ2lzdGVyZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IHRoaXMuaGFzaFBhc3N3b3JkKGRhdGEucGFzc3dvcmQpO1xuXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmNyZWF0ZSh7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIGVtYWlsOiBkYXRhLmVtYWlsLnRvTG93ZXJDYXNlKCksXG4gICAgICAgIGZpcnN0TmFtZTogZGF0YS5maXJzdE5hbWUsXG4gICAgICAgIGxhc3ROYW1lOiBkYXRhLmxhc3ROYW1lLFxuICAgICAgICBwYXNzd29yZEhhc2g6IGhhc2hlZFBhc3N3b3JkLFxuICAgICAgICB0ZW5hbnRJZDogZGF0YS50ZW5hbnRJZCxcbiAgICAgICAgYnJhbmNoSWQ6IGRhdGEuYnJhbmNoSWQsXG4gICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgICAgICBtZmFFbmFibGVkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBpbmNsdWRlOiB7XG4gICAgICAgIHJvbGVzOiB7XG4gICAgICAgICAgaW5jbHVkZToge1xuICAgICAgICAgICAgcm9sZToge1xuICAgICAgICAgICAgICBpbmNsdWRlOiB7XG4gICAgICAgICAgICAgICAgcGVybWlzc2lvbnM6IHtcbiAgICAgICAgICAgICAgICAgIGluY2x1ZGU6IHsgcGVybWlzc2lvbjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgcGVybWlzc2lvbnMgPSB1c2VyLnJvbGVzLmZsYXRNYXAodXIgPT5cbiAgICAgIHVyLnJvbGUucGVybWlzc2lvbnMubWFwKHJwID0+IHJwLnBlcm1pc3Npb24uY29kZSksXG4gICAgKTtcblxuICAgIGNvbnN0IHJvbGVzID0gdXNlci5yb2xlcy5tYXAodXIgPT4gdXIucm9sZS5jb2RlKTtcblxuICAgIHJldHVybiB7XG4gICAgICBpZDogdXNlci5pZCxcbiAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgZmlyc3ROYW1lOiB1c2VyLmZpcnN0TmFtZSxcbiAgICAgIGxhc3ROYW1lOiB1c2VyLmxhc3ROYW1lLFxuICAgICAgdGVuYW50SWQ6IHVzZXIudGVuYW50SWQsXG4gICAgICBicmFuY2hJZDogdXNlci5icmFuY2hJZCB8fCB1bmRlZmluZWQsXG4gICAgICByb2xlcyxcbiAgICAgIHBlcm1pc3Npb25zLFxuICAgICAgbWZhRW5hYmxlZDogdXNlci5tZmFFbmFibGVkLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhc2hQYXNzd29yZChwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEyKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUGF5bG9hZCh1c2VyOiBKd3RVc2VyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1YjogdXNlci5pZCxcbiAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgdGVuYW50SWQ6IHVzZXIudGVuYW50SWQsXG4gICAgICBicmFuY2hJZDogdXNlci5icmFuY2hJZCxcbiAgICAgIHJvbGVzOiB1c2VyLnJvbGVzLFxuICAgICAgcGVybWlzc2lvbnM6IHVzZXIucGVybWlzc2lvbnMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VFeHBpcnkoZXhwaXJ5OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IG1hdGNoID0gZXhwaXJ5Lm1hdGNoKC9eKFxcZCspKFtzbWhkXSkkLyk7XG4gICAgaWYgKCFtYXRjaCkgcmV0dXJuIDg2NDAwO1xuXG4gICAgY29uc3QgdmFsdWUgPSBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgIGNvbnN0IHVuaXQgPSBtYXRjaFsyXTtcblxuICAgIHN3aXRjaCAodW5pdCkge1xuICAgICAgY2FzZSAncyc6IHJldHVybiB2YWx1ZTtcbiAgICAgIGNhc2UgJ20nOiByZXR1cm4gdmFsdWUgKiA2MDtcbiAgICAgIGNhc2UgJ2gnOiByZXR1cm4gdmFsdWUgKiAzNjAwO1xuICAgICAgY2FzZSAnZCc6IHJldHVybiB2YWx1ZSAqIDg2NDAwO1xuICAgICAgZGVmYXVsdDogcmV0dXJuIDg2NDAwO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc3RvcmVSZWZyZXNoVG9rZW4odXNlcklkOiBzdHJpbmcsIHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBleHBpcmVzQXQgPSBuZXcgRGF0ZShEYXRlLm5vdygpICsgdGhpcy5wYXJzZUV4cGlyeShlbnYuand0LnJlZnJlc2hFeHBpcmVzSW4pICogMTAwMCk7XG4gICAgYXdhaXQgcHJpc21hLnJlZnJlc2hUb2tlbi5jcmVhdGUoe1xuICAgICAgZGF0YTogeyB1c2VySWQsIHRva2VuLCBleHBpcmVzQXQgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVjb3JkRmFpbGVkTG9naW4odXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBwcmlzbWEubG9naW5BdHRlbXB0LmNyZWF0ZSh7XG4gICAgICBkYXRhOiB7IHVzZXJJZCwgc3VjY2VzczogZmFsc2UsIGlwQWRkcmVzczogJ3Vua25vd24nLCB1c2VyQWdlbnQ6ICd1bmtub3duJyB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZWNvcmRTdWNjZXNzZnVsTG9naW4odXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBwcmlzbWEubG9naW5BdHRlbXB0LmNyZWF0ZSh7XG4gICAgICBkYXRhOiB7IHVzZXJJZCwgc3VjY2VzczogdHJ1ZSwgaXBBZGRyZXNzOiAndW5rbm93bicsIHVzZXJBZ2VudDogJ3Vua25vd24nIH0sXG4gICAgfSk7XG4gICAgYXdhaXQgcHJpc21hLnVzZXIudXBkYXRlKHtcbiAgICAgIHdoZXJlOiB7IGlkOiB1c2VySWQgfSxcbiAgICAgIGRhdGE6IHsgbGFzdExvZ2luQXQ6IG5ldyBEYXRlKCkgfSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEF1dGhUb2tlbnMge1xuICBhY2Nlc3NUb2tlbjogc3RyaW5nO1xuICByZWZyZXNoVG9rZW46IHN0cmluZztcbiAgZXhwaXJlc0luOiBudW1iZXI7XG4gIHRva2VuVHlwZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlZ2lzdGVySW5wdXQge1xuICBlbWFpbDogc3RyaW5nO1xuICBmaXJzdE5hbWU6IHN0cmluZztcbiAgbGFzdE5hbWU6IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbiAgdGVuYW50SWQ6IHN0cmluZztcbiAgYnJhbmNoSWQ/OiBzdHJpbmc7XG59Il19