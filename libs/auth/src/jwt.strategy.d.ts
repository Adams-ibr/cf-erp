import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): Promise<JwtUser>;
}
export interface JwtPayload {
    sub: string;
    email: string;
    tenantId: string;
    branchId?: string;
    roles: string[];
    permissions: string[];
    iat: number;
    exp: number;
    iss: string;
    aud: string;
}
export interface JwtUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    branchId?: string;
    roles: string[];
    permissions: string[];
    mfaEnabled: boolean;
}
export {};
