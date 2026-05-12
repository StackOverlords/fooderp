import type { FastifyInstance } from 'fastify'
import { getAppConfigUseCase } from '../../shared/container'

export async function configRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['config'],
        summary: 'Configuración de la aplicación',
        description: 'Devuelve el modo de operación y si el sistema ya fue configurado. No requiere autenticación.',
        response: {
          200: {
            type: 'object',
            properties: {
              mode: { type: 'string', enum: ['saas', 'client-vps'] },
              setupDone: { type: 'boolean' },
            },
          },
        },
      },
    },
    async () => {
      return getAppConfigUseCase()
    },
  )
}
