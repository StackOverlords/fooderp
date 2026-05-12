import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from './app-error'
import { getLocale } from '../i18n/locale'
import { translateMessage } from '../i18n/messages'

interface ErrorResponse {
  message: string
  error: {
    code: string
    statusCode: number
  }
}

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  request.log.error({ err: error }, error.message)

  const locale = getLocale(request)

  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      message: translateMessage(error.message, locale),
      error: { code: error.code, statusCode: error.statusCode },
    } satisfies ErrorResponse)
    return
  }

  const fastifyError = error as FastifyError

  if (fastifyError.validation) {
    reply.status(400).send({
      message: translateMessage(error.message, locale),
      error: { code: 'VALIDATION_ERROR', statusCode: 400 },
    } satisfies ErrorResponse)
    return
  }

  const statusCode = fastifyError.statusCode ?? 500
  const rawMessage =
    process.env.NODE_ENV === 'production' && statusCode >= 500
      ? 'Internal server error'
      : error.message

  reply.status(statusCode).send({
    message: translateMessage(rawMessage, locale),
    error: { code: 'INTERNAL_ERROR', statusCode },
  } satisfies ErrorResponse)
}
