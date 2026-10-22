import { JwtService } from '@nestjs/jwt';
import { JwtUser } from './jwt.strategy';
export declare class AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    validateUser(email: string, password: string): Promise<JwtUser | null>;
    login(user: JwtUser): Promise<AuthTokens>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    logout(userId: string, refreshToken?: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    resetPassword(email: string, newPassword: string, token: string): Promise<void>;
    requestPasswordReset(email: string): Promise<void>;
    register(data: RegisterInput): Promise<JwtUser>;
    private hashPassword;
    private createPayload;
    private parseExpiry;
    private storeRefreshToken;
    private recordFailedLogin;
    private recordSuccessfulLogin;
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
