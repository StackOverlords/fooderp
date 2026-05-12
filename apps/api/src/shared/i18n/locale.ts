import type { FastifyRequest } from 'fastify'
import type { Locale } from './messages'

const SUPPORTED: Locale[] = ['es', 'en']

export function getLocale(request: FastifyRequest): Locale {
  const header = request.headers['accept-language'] ?? ''
  const primary = header.split(',')[0]?.split(';')[0]?.trim().slice(0, 2).toLowerCase()
  return (SUPPORTED.includes(primary as Locale) ? primary : 'es') as Locale
}
