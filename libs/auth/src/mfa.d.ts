export declare class MfaService {
    generateSecret(userEmail: string, issuer?: string): MfaSecret;
    generateQrCode(otpauthUrl: string): Promise<string>;
    verifyToken(secret: string, token: string, window?: number): boolean;
    generateBackupCodes(count?: number): string[];
    private generateBackupCode;
    enableMfa(userId: string, secret: string, backupCodes: string[]): Promise<void>;
    disableMfa(userId: string): Promise<void>;
    verifyBackupCode(userId: string, code: string): Promise<boolean>;
    regenerateBackupCodes(userId: string): Promise<string[]>;
}
export interface MfaSecret {
    base32: string;
    otpauthUrl: string;
}
export interface MfaSetupResult {
    secret: MfaSecret;
    qrCodeUrl: string;
    backupCodes: string[];
}
export declare const mfaService: MfaService;
