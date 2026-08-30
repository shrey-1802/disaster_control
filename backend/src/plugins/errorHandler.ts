import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError.js';
import { errorResponse } from '../shared/utils/response.js';
import { env } from '../config/env.js';

export function setupErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | AppError | Error, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id;

    // 1. Handled AppError Hierarchy
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(
        errorResponse(error.code, error.message, error.details, { requestId })
      );
    }

    // 2. Zod Schema Validation Errors
    if (error instanceof ZodError) {
      const details = error.issues.map(i => ({ field: i.path.join('.'), message: i.message }));
      return reply.status(400).send(
        errorResponse('VALIDATION_FAILED', 'Input validation failed. Please check required fields.', details, { requestId })
      );
    }

    // 3. Fastify Validation Errors
    if ('validation' in error && error.validation) {
      return reply.status(400).send(
        errorResponse('VALIDATION_FAILED', error.message, error.validation, { requestId })
      );
    }

    // 4. Fastify Rate Limit Error
    if ('statusCode' in error && error.statusCode === 429) {
      return reply.status(429).send(
        errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests. Please slow down.', undefined, { requestId })
      );
    }

    // 5. Unhandled / Internal Server Error
    request.log.error({ err: error, requestId }, 'Unhandled Server Error');

    const message = env.NODE_ENV === 'production'
      ? 'An internal operational error occurred. The incident has been logged.'
      : error.message;

    return reply.status(500).send(
      errorResponse('INTERNAL_SERVER_ERROR', message, undefined, { requestId })
    );
  });
}
