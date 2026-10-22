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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mfaService = exports.MfaService = void 0;
const speakeasy = __importStar(require("speakeasy"));
const qrcode = __importStar(require("qrcode"));
const database_1 = require("@cf-erp/database");
class MfaService {
    generateSecret(userEmail, issuer = 'CF-ERP') {
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
    async generateQrCode(otpauthUrl) {
        return qrcode.toDataURL(otpauthUrl);
    }
    verifyToken(secret, token, window = 1) {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window,
        });
    }
    generateBackupCodes(count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push(this.generateBackupCode());
        }
        return codes;
    }
    generateBackupCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    async enableMfa(userId, secret, backupCodes) {
        const hashedBackupCodes = await Promise.all(backupCodes.map(code => bcrypt.hash(code, 10)));
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: true,
                mfaSecret: secret,
                mfaBackupCodes: hashedBackupCodes,
            },
        });
    }
    async disableMfa(userId) {
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: false,
                mfaSecret: null,
                mfaBackupCodes: [],
            },
        });
    }
    async verifyBackupCode(userId, code) {
        const user = await database_1.prisma.user.findUnique({
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
                await database_1.prisma.user.update({
                    where: { id: userId },
                    data: { mfaBackupCodes: updatedCodes },
                });
                return true;
            }
        }
        return false;
    }
    async regenerateBackupCodes(userId) {
        const backupCodes = this.generateBackupCodes();
        const hashedBackupCodes = await Promise.all(backupCodes.map(code => bcrypt.hash(code, 10)));
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { mfaBackupCodes: hashedBackupCodes },
        });
        return backupCodes;
    }
}
exports.MfaService = MfaService;
exports.mfaService = new MfaService();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWZhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWZhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFEQUF1QztBQUN2QywrQ0FBaUM7QUFDakMsK0NBQTBDO0FBRTFDLE1BQWEsVUFBVTtJQUNyQixjQUFjLENBQUMsU0FBaUIsRUFBRSxNQUFNLEdBQUcsUUFBUTtRQUNqRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO1lBQ3RDLElBQUksRUFBRSxHQUFHLE1BQU0sS0FBSyxTQUFTLEdBQUc7WUFDaEMsTUFBTTtZQUNOLE1BQU0sRUFBRSxFQUFFO1NBQ1gsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNMLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtZQUNyQixVQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVcsSUFBSSxFQUFFO1NBQ3JDLENBQUM7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFrQjtRQUNyQyxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELFdBQVcsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLE1BQU0sR0FBRyxDQUFDO1FBQ25ELE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDM0IsTUFBTTtZQUNOLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLEtBQUs7WUFDTCxNQUFNO1NBQ1AsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG1CQUFtQixDQUFDLEtBQUssR0FBRyxFQUFFO1FBQzVCLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztRQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDL0IsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxD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Q0FBQztRQUNILENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxLQUFLLENBQUMscUJBQXFCLENBQUMsTUFBYztRQUN4QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMvQyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDekMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQy9DLENBQUM7UUFFRixNQUFNLGlCQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN2QixLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFO1lBQ3JCLElBQUksRUFBRSxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBRTtTQUM1QyxDQUFDLENBQUM7UUFFSCxPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0NBQ0Y7QUEvR0QsZ0NBK0dDO0FBYVksUUFBQSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNwZWFrZWFzeSBmcm9tICdzcGVha2Vhc3knO1xuaW1wb3J0ICogYXMgcXJjb2RlIGZyb20gJ3FyY29kZSc7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAY2YtZXJwL2RhdGFiYXNlJztcblxuZXhwb3J0IGNsYXNzIE1mYVNlcnZpY2Uge1xuICBnZW5lcmF0ZVNlY3JldCh1c2VyRW1haWw6IHN0cmluZywgaXNzdWVyID0gJ0NGLUVSUCcpOiBNZmFTZWNyZXQge1xuICAgIGNvbnN0IHNlY3JldCA9IHNwZWFrZWFzeS5nZW5lcmF0ZVNlY3JldCh7XG4gICAgICBuYW1lOiBgJHtpc3N1ZXJ9ICgke3VzZXJFbWFpbH0pYCxcbiAgICAgIGlzc3VlcixcbiAgICAgIGxlbmd0aDogMzIsXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgYmFzZTMyOiBzZWNyZXQuYmFzZTMyLFxuICAgICAgb3RwYXV0aFVybDogc2VjcmV0Lm90cGF1dGhfdXJsIHx8ICcnLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBnZW5lcmF0ZVFyQ29kZShvdHBhdXRoVXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBxcmNvZGUudG9EYXRhVVJMKG90cGF1dGhVcmwpO1xuICB9XG5cbiAgdmVyaWZ5VG9rZW4oc2VjcmV0OiBzdHJpbmcsIHRva2VuOiBzdHJpbmcsIHdpbmRvdyA9IDEpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3BlYWtlYXN5LnRvdHAudmVyaWZ5KHtcbiAgICAgIHNlY3JldCxcbiAgICAgIGVuY29kaW5nOiAnYmFzZTMyJyxcbiAgICAgIHRva2VuLFxuICAgICAgd2luZG93LFxuICAgIH0pO1xuICB9XG5cbiAgZ2VuZXJhdGVCYWNrdXBDb2Rlcyhjb3VudCA9IDEwKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGNvZGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgY29kZXMucHVzaCh0aGlzLmdlbmVyYXRlQmFja3VwQ29kZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvZGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZUJhY2t1cENvZGUoKTogc3RyaW5nIHtcbiAgICBjb25zdCBjaGFycyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODknO1xuICAgIGxldCBjb2RlID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgIGNvZGUgKz0gY2hhcnMuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNoYXJzLmxlbmd0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gY29kZTtcbiAgfVxuXG4gIGFzeW5jIGVuYWJsZU1mYSh1c2VySWQ6IHN0cmluZywgc2VjcmV0OiBzdHJpbmcsIGJhY2t1cENvZGVzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGhhc2hlZEJhY2t1cENvZGVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICBiYWNrdXBDb2Rlcy5tYXAoY29kZSA9PiBiY3J5cHQuaGFzaChjb2RlLCAxMCkpLFxuICAgICk7XG5cbiAgICBhd2FpdCBwcmlzbWEudXNlci51cGRhdGUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IHVzZXJJZCB9LFxuICAgICAgZGF0YToge1xuICAgICAgICBtZmFFbmFibGVkOiB0cnVlLFxuICAgICAgICBtZmFTZWNyZXQ6IHNlY3JldCxcbiAgICAgICAgbWZhQmFja3VwQ29kZXM6IGhhc2hlZEJhY2t1cENvZGVzLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRpc2FibGVNZmEodXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBwcmlzbWEudXNlci51cGRhdGUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IHVzZXJJZCB9LFxuICAgICAgZGF0YToge1xuICAgICAgICBtZmFFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgbWZhU2VjcmV0OiBudWxsLFxuICAgICAgICBtZmFCYWNrdXBDb2RlczogW10sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgdmVyaWZ5QmFja3VwQ29kZSh1c2VySWQ6IHN0cmluZywgY29kZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IHVzZXJJZCB9LFxuICAgICAgc2VsZWN0OiB7IG1mYUJhY2t1cENvZGVzOiB0cnVlIH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIXVzZXIgfHwgIXVzZXIubWZhQmFja3VwQ29kZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1c2VyLm1mYUJhY2t1cENvZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBoYXNoZWRDb2RlID0gdXNlci5tZmFCYWNrdXBDb2Rlc1tpXTtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShjb2RlLCBoYXNoZWRDb2RlKTtcblxuICAgICAgaWYgKGlzVmFsaWQpIHtcbiAgICAgICAgLy8gUmVtb3ZlIHVzZWQgYmFja3VwIGNvZGVcbiAgICAgICAgY29uc3QgdXBkYXRlZENvZGVzID0gdXNlci5tZmFCYWNrdXBDb2Rlcy5maWx0ZXIoKF8sIGluZGV4KSA9PiBpbmRleCAhPT0gaSk7XG4gICAgICAgIGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XG4gICAgICAgICAgd2hlcmU6IHsgaWQ6IHVzZXJJZCB9LFxuICAgICAgICAgIGRhdGE6IHsgbWZhQmFja3VwQ29kZXM6IHVwZGF0ZWRDb2RlcyB9LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYXN5bmMgcmVnZW5lcmF0ZUJhY2t1cENvZGVzKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IGJhY2t1cENvZGVzID0gdGhpcy5nZW5lcmF0ZUJhY2t1cENvZGVzKCk7XG4gICAgY29uc3QgaGFzaGVkQmFja3VwQ29kZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIGJhY2t1cENvZGVzLm1hcChjb2RlID0+IGJjcnlwdC5oYXNoKGNvZGUsIDEwKSksXG4gICAgKTtcblxuICAgIGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XG4gICAgICB3aGVyZTogeyBpZDogdXNlcklkIH0sXG4gICAgICBkYXRhOiB7IG1mYUJhY2t1cENvZGVzOiBoYXNoZWRCYWNrdXBDb2RlcyB9LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGJhY2t1cENvZGVzO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWZhU2VjcmV0IHtcbiAgYmFzZTMyOiBzdHJpbmc7XG4gIG90cGF1dGhVcmw6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZmFTZXR1cFJlc3VsdCB7XG4gIHNlY3JldDogTWZhU2VjcmV0O1xuICBxckNvZGVVcmw6IHN0cmluZztcbiAgYmFja3VwQ29kZXM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY29uc3QgbWZhU2VydmljZSA9IG5ldyBNZmFTZXJ2aWNlKCk7Il19