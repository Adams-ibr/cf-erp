import * as Joi from 'joi';
export declare const envValidationSchema: Joi.ObjectSchema<any>;
export declare function validateEnv(config: Record<string, unknown>): void;
