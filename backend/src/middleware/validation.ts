import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(50).required()
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  applicationCreate: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(500).optional(),
    template: Joi.string().optional()
  }),

  schemaCreate: Joi.object({
    schemaDefinition: Joi.object().required(),
    version: Joi.number().optional()
  }),

  apiEndpointCreate: Joi.object({
    path: Joi.string().required(),
    method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
    schema: Joi.object().required(),
    authenticationRequired: Joi.boolean().optional(),
    rateLimit: Joi.number().optional()
  }),

  deploymentCreate: Joi.object({
    environment: Joi.string().valid('development', 'staging', 'production').required(),
    config: Joi.object().optional()
  })
};