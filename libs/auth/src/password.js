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
exports.passwordService = exports.PasswordService = void 0;
const bcrypt = __importStar(require("bcrypt"));
class PasswordService {
    saltRounds = 12;
    async hash(password) {
        return bcrypt.hash(password, this.saltRounds);
    }
    async verify(password, hash) {
        return bcrypt.compare(password, hash);
    }
    validateStrength(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        };
        const score = Object.values(checks).filter(Boolean).length;
        let strength;
        if (score <= 1)
            strength = 'very_weak';
        else if (score === 2)
            strength = 'weak';
        else if (score === 3)
            strength = 'fair';
        else if (score === 4)
            strength = 'good';
        else
            strength = 'strong';
        return {
            valid: score >= 3,
            score,
            strength,
            checks,
            feedback: this.generateFeedback(checks),
        };
    }
    generateRandomPassword(length = 16) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }
    generateFeedback(checks) {
        const feedback = [];
        if (!checks.length)
            feedback.push('Password must be at least 8 characters long');
        if (!checks.uppercase)
            feedback.push('Password must contain at least one uppercase letter');
        if (!checks.lowercase)
            feedback.push('Password must contain at least one lowercase letter');
        if (!checks.number)
            feedback.push('Password must contain at least one number');
        if (!checks.special)
            feedback.push('Password must contain at least one special character');
        return feedback;
    }
}
exports.PasswordService = PasswordService;
exports.passwordService = new PasswordService();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFzc3dvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYXNzd29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFFakMsTUFBYSxlQUFlO0lBQ1QsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUVqQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQWdCO1FBQ3pCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQWdCLEVBQUUsSUFBWTtRQUN6QyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxRQUFnQjtRQUMvQixNQUFNLE1BQU0sR0FBRztZQUNiLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7WUFDNUIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2pDLFNBQVMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDM0IsT0FBTyxFQUFFLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDaEUsQ0FBQztRQUVGLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUMzRCxJQUFJLFFBQTJELENBQUM7UUFFaEUsSUFBSSxLQUFLLElBQUksQ0FBQztZQUFFLFFBQVEsR0FBRyxXQUFXLENBQUM7YUFDbEMsSUFBSSxLQUFLLEtBQUssQ0FBQztZQUFFLFFBQVEsR0FBRyxNQUFNLENBQUM7YUFDbkMsSUFBSSxLQUFLLEtBQUssQ0FBQztZQUFFLFFBQVEsR0FBRyxNQUFNLENBQUM7YUFDbkMsSUFBSSxLQUFLLEtBQUssQ0FBQztZQUFFLFFBQVEsR0FBRyxNQUFNLENBQUM7O1lBQ25DLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFekIsT0FBTztZQUNMLEtBQUssRUFBRSxLQUFLLElBQUksQ0FBQztZQUNqQixLQUFLO1lBQ0wsUUFBUTtZQUNSLE1BQU07WUFDTixRQUFRLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztTQUN4QyxDQUFDO0lBQ0osQ0FBQztJQUVELHNCQUFzQixDQUFDLE1BQU0sR0FBRyxFQUFFO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLHdFQUF3RSxDQUFDO1FBQ3pGLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxNQUErQjtRQUN0RCxNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUztZQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMscURBQXFELENBQUMsQ0FBQztRQUM1RixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVM7WUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLENBQUM7UUFDNUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQUUsUUFBUSxDQUFDLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztZQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsc0RBQXNELENBQUMsQ0FBQztRQUMzRixPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0NBQ0Y7QUF4REQsMENBd0RDO0FBZ0JZLFFBQUEsZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSAnYmNyeXB0JztcblxuZXhwb3J0IGNsYXNzIFBhc3N3b3JkU2VydmljZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgc2FsdFJvdW5kcyA9IDEyO1xuXG4gIGFzeW5jIGhhc2gocGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIGJjcnlwdC5oYXNoKHBhc3N3b3JkLCB0aGlzLnNhbHRSb3VuZHMpO1xuICB9XG5cbiAgYXN5bmMgdmVyaWZ5KHBhc3N3b3JkOiBzdHJpbmcsIGhhc2g6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgaGFzaCk7XG4gIH1cblxuICB2YWxpZGF0ZVN0cmVuZ3RoKHBhc3N3b3JkOiBzdHJpbmcpOiBQYXNzd29yZFN0cmVuZ3RoUmVzdWx0IHtcbiAgICBjb25zdCBjaGVja3MgPSB7XG4gICAgICBsZW5ndGg6IHBhc3N3b3JkLmxlbmd0aCA+PSA4LFxuICAgICAgdXBwZXJjYXNlOiAvW0EtWl0vLnRlc3QocGFzc3dvcmQpLFxuICAgICAgbG93ZXJjYXNlOiAvW2Etel0vLnRlc3QocGFzc3dvcmQpLFxuICAgICAgbnVtYmVyOiAvXFxkLy50ZXN0KHBhc3N3b3JkKSxcbiAgICAgIHNwZWNpYWw6IC9bIUAjJCVeJiooKV8rXFwtPVxcW1xcXXt9Oyc6XCJcXFxcfCwuPD5cXC8/XS8udGVzdChwYXNzd29yZCksXG4gICAgfTtcblxuICAgIGNvbnN0IHNjb3JlID0gT2JqZWN0LnZhbHVlcyhjaGVja3MpLmZpbHRlcihCb29sZWFuKS5sZW5ndGg7XG4gICAgbGV0IHN0cmVuZ3RoOiAndmVyeV93ZWFrJyB8ICd3ZWFrJyB8ICdmYWlyJyB8ICdnb29kJyB8ICdzdHJvbmcnO1xuXG4gICAgaWYgKHNjb3JlIDw9IDEpIHN0cmVuZ3RoID0gJ3Zlcnlfd2Vhayc7XG4gICAgZWxzZSBpZiAoc2NvcmUgPT09IDIpIHN0cmVuZ3RoID0gJ3dlYWsnO1xuICAgIGVsc2UgaWYgKHNjb3JlID09PSAzKSBzdHJlbmd0aCA9ICdmYWlyJztcbiAgICBlbHNlIGlmIChzY29yZSA9PT0gNCkgc3RyZW5ndGggPSAnZ29vZCc7XG4gICAgZWxzZSBzdHJlbmd0aCA9ICdzdHJvbmcnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiBzY29yZSA+PSAzLFxuICAgICAgc2NvcmUsXG4gICAgICBzdHJlbmd0aCxcbiAgICAgIGNoZWNrcyxcbiAgICAgIGZlZWRiYWNrOiB0aGlzLmdlbmVyYXRlRmVlZGJhY2soY2hlY2tzKSxcbiAgICB9O1xuICB9XG5cbiAgZ2VuZXJhdGVSYW5kb21QYXNzd29yZChsZW5ndGggPSAxNik6IHN0cmluZyB7XG4gICAgY29uc3QgY2hhcnNldCA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMDEyMzQ1Njc4OSFAIyQlXiYqJztcbiAgICBsZXQgcGFzc3dvcmQgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYXNzd29yZCArPSBjaGFyc2V0LmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFyc2V0Lmxlbmd0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gcGFzc3dvcmQ7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlRmVlZGJhY2soY2hlY2tzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPik6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBmZWVkYmFjazogc3RyaW5nW10gPSBbXTtcbiAgICBpZiAoIWNoZWNrcy5sZW5ndGgpIGZlZWRiYWNrLnB1c2goJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmcnKTtcbiAgICBpZiAoIWNoZWNrcy51cHBlcmNhc2UpIGZlZWRiYWNrLnB1c2goJ1Bhc3N3b3JkIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgdXBwZXJjYXNlIGxldHRlcicpO1xuICAgIGlmICghY2hlY2tzLmxvd2VyY2FzZSkgZmVlZGJhY2sucHVzaCgnUGFzc3dvcmQgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBsb3dlcmNhc2UgbGV0dGVyJyk7XG4gICAgaWYgKCFjaGVja3MubnVtYmVyKSBmZWVkYmFjay5wdXNoKCdQYXNzd29yZCBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIG51bWJlcicpO1xuICAgIGlmICghY2hlY2tzLnNwZWNpYWwpIGZlZWRiYWNrLnB1c2goJ1Bhc3N3b3JkIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3BlY2lhbCBjaGFyYWN0ZXInKTtcbiAgICByZXR1cm4gZmVlZGJhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXNzd29yZFN0cmVuZ3RoUmVzdWx0IHtcbiAgdmFsaWQ6IGJvb2xlYW47XG4gIHNjb3JlOiBudW1iZXI7XG4gIHN0cmVuZ3RoOiAndmVyeV93ZWFrJyB8ICd3ZWFrJyB8ICdmYWlyJyB8ICdnb29kJyB8ICdzdHJvbmcnO1xuICBjaGVja3M6IHtcbiAgICBsZW5ndGg6IGJvb2xlYW47XG4gICAgdXBwZXJjYXNlOiBib29sZWFuO1xuICAgIGxvd2VyY2FzZTogYm9vbGVhbjtcbiAgICBudW1iZXI6IGJvb2xlYW47XG4gICAgc3BlY2lhbDogYm9vbGVhbjtcbiAgfTtcbiAgZmVlZGJhY2s6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY29uc3QgcGFzc3dvcmRTZXJ2aWNlID0gbmV3IFBhc3N3b3JkU2VydmljZSgpOyJdfQ==