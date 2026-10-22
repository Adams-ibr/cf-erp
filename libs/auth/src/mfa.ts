import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { prisma } from '@cf-erp/database';

export class MfaService {
  generateSecret(userEmail: string, issuer = 'CF-ERP'): MfaSecret {
    const secret = speakeasy.generateSecret({
      name: `${issuer} (${userEmail})`,
      issuer,
      length: 32,
    });

    return {
      base32: secret.base32,
      otpauthUrl: secret.otpauth_url || '',
    };
  }

  async generateQrCode(otpauthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpauthUrl);
  }

  verifyToken(secret: string, token: string, window = 1): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window,
    });
  }

  generateBackupCodes(count = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateBackupCode());
    }
    return codes;
  }

  private generateBackupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async enableMfa(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10)),
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: secret,
        mfaBackupCodes: hashedBackupCodes,
      },
    });
  }

  async disableMfa(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      },
    });
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaBackupCodes: true },
    });

    if (!user || !user.mfaBackupCodes.length) {
      return false;
    }

    for (let i = 0; i < user.mfaBackupCodes.length; i++) {
      const hashedCode = user.mfaBackupCodes[i];
      const isValid = await bcrypt.compare(code, hashedCode);

      if (isValid) {
        // Remove used backup code
        const updatedCodes = user.mfaBackupCodes.filter((_, index) => index !== i);
        await prisma.user.update({
          where: { id: userId },
          data: { mfaBackupCodes: updatedCodes },
        });
        return true;
      }
    }

    return false;
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10)),
    );

    await prisma.user.update({
      where: { id: userId },
      data: { mfaBackupCodes: hashedBackupCodes },
    });

    return backupCodes;
  }
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

export const mfaService = new MfaService();