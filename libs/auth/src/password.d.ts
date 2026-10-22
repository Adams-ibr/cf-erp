export declare class PasswordService {
    private readonly saltRounds;
    hash(password: string): Promise<string>;
    verify(password: string, hash: string): Promise<boolean>;
    validateStrength(password: string): PasswordStrengthResult;
    generateRandomPassword(length?: number): string;
    private generateFeedback;
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
export declare const passwordService: PasswordService;
