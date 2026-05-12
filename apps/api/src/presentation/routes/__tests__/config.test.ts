import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { createServer } from '../../../app'
import { createGetAppConfigUseCase } from '../../../application/config/get-app-config.use-case'
import type { ITenantRepository } from '../../../domain/repositories/i-tenant-repository'

// Integration test — requires a real PostgreSQL connection (DATABASE_URL) and JWT_SECRET
// Nota: SUPER_ADMIN_KEY está siempre seteado en vitest.config.ts (modo SaaS por defecto).
// CO-01 se testea como unit test sobre el use case con mock de repositorio.
// CO-02, CO-03, CO-04 son integration tests contra el servidor real.

const prisma = new PrismaClient()

const TEST = {
  tenantSlug: 'test-config-tenant',
  tenantSchema: 'tenant_test_config',
}

let server: FastifyInstance
let tenantId: string
let planId: string

beforeAll(async () => {
  process.env.JWT_SECRET ??= 'vitest-jwt-secret-at-least-32-chars-long'

  server = await createServer()

  await prisma.$connect()

  const plan = await prisma.plan.upsert({
    where: { name: '_test-plan-config' },
    update: { maxBranches: 1, maxUsers: 5 },
    create: { name: '_test-plan-config', maxBranches: 1, maxUsers: 5 },
  })
  planId = plan.id

  // Crear tenant de prueba para los escenarios CO-02, CO-03
  const tenant = await prisma.tenant.upsert({
    where: { slug: TEST.tenantSlug },
    update: {},
    create: {
      name: 'Config Test Tenant',
      slug: TEST.tenantSlug,
      schema: TEST.tenantSchema,
      status: 'ACTIVE',
      subscription: { create: { planId, status: 'ACTIVE' } },
    },
  })
  tenantId = tenant.id
})

afterAll(async () => {
  await prisma.subscription.deleteMany({ where: { tenantId } })
  await prisma.tenant.delete({ where: { slug: TEST.tenantSlug } })
  await prisma.plan.deleteMany({ where: { name: '_test-plan-config' } })
  await prisma.$disconnect()
  await server.close()
  vi.unstubAllEnvs()
})

// ─── CO-01 — Unit test: Client-VPS sin tenant ─────────────────────────────────
// La prueba de integración no puede garantizar count()==0 con otros tests corriendo,
// así que CO-01 se valida con mock de repositorio directamente sobre el use case.

describe('getAppConfig use case — unit', () => {
  it('CO-01 — Client-VPS sin tenant → { mode: client-vps, setupDone: false }', async () => {
    const mockRepository = { count: async () => 0 } as unknown as ITenantRepository
    const getAppConfig = createGetAppConfigUseCase({
      tenantRepository: mockRepository,
      getMode: () => 'client-vps',
    })

    const result = await getAppConfig()

    expect(result.mode).toBe('client-vps')
    expect(result.setupDone).toBe(false)
  })
})

// ─── GET /api/v1/config — integration ────────────────────────────────────────

describe('GET /api/v1/config', () => {
  it('CO-02 — Client-VPS con tenant → { mode: client-vps, setupDone: true }', async () => {
    // SUPER_ADMIN_KEY está seteado en vitest.config.ts; lo limpiamos para modo client-vps
    vi.stubEnv('SUPER_ADMIN_KEY', '')

    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/config',
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ mode: string; setupDone: boolean }>()
    expect(body.mode).toBe('client-vps')
    expect(body.setupDone).toBe(true)

    vi.unstubAllEnvs()
  })

  it('CO-03 — SaaS (SUPER_ADMIN_KEY seteado) → { mode: saas, setupDone: true }', async () => {
    vi.stubEnv('SUPER_ADMIN_KEY', 'test-key-saas')

    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/config',
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ mode: string; setupDone: boolean }>()
    expect(body.mode).toBe('saas')
    expect(body.setupDone).toBe(true)

    vi.unstubAllEnvs()
  })

  it('CO-04 — No requiere Authorization header → responde 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/config',
      // Sin headers de Authorization
    })

    expect(res.statusCode).toBe(200)
  })
})
