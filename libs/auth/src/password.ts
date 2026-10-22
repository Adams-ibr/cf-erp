import * as bcrypt from 'bcrypt';

export class PasswordService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validateStrength(password: string): PasswordStrengthResult {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    let strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';

    if (score <= 1) strength = 'very_weak';
    else if (score === 2) strength = 'weak';
    else if (score === 3) strength = 'fair';
    else if (score === 4) strength = 'good';
    else strength = 'strong';

    return {
      valid: score >= 3,
      score,
      strength,
      checks,
      feedback: this.generateFeedback(checks),
    };
  }

  generateRandomPassword(length = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  private generateFeedback(checks: Record<string, boolean>): string[] {
    const feedback: string[] = [];
    if (!checks.length) feedback.push('Password must be at least 8 characters long');
    if (!checks.uppercase) feedback.push('Password must contain at least one uppercase letter');
    if (!checks.lowercase) feedback.push('Password must contain at least one lowercase letter');
    if (!checks.number) feedback.push('Password must contain at least one number');
    if (!checks.special) feedback.push('Password must contain at least one special character');
    return feedback;
  }
}

export interface PasswordStrengthResult {
  valid: boolean;
  score: number;
  strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  feedback: string[];
}

export const passwordService = new PasswordService();