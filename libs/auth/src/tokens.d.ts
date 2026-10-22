import { JwtService } from '@nestjs/jwt';
export declare class TokenService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    generateAccessToken(payload: TokenPayload): string;
    generateRefreshToken(userId: string): string;
    generateEmailVerificationToken(userId: string): string;
    generatePasswordResetToken(userId: string): string;
    generateInvitationToken(email: string, tenantId: string, roleId: string): string;
    generateApiKeyToken(userId: string, permissions: string[]): string;
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): RefreshTokenPayload;
    verifyEmailVerificationToken(token: string): VerificationTokenPayload;
    verifyPasswordResetToken(token: string): VerificationTokenPayload;
    verifyInvitationToken(token: string): InvitationTokenPayload;
    storeRefreshToken(userId: string, token: string): Promise<void>;
    revokeRefreshToken(userId: string, token?: string): Promise<void>;
    validateRefreshToken(token: string): Promise<boolean>;
    private parseExpiry;
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
