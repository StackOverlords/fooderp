import type { ITenantRepository } from '../../domain/repositories/i-tenant-repository'

export type AppMode = 'saas' | 'client-vps'

export interface AppConfigResult {
  mode: AppMode
  setupDone: boolean
}

interface Dependencies {
  tenantRepository: ITenantRepository
  getMode: () => AppMode
}

export function createGetAppConfigUseCase({ tenantRepository, getMode }: Dependencies) {
  return async function getAppConfig(): Promise<AppConfigResult> {
    const setupDone = (await tenantRepository.count()) > 0
    const mode = getMode()
    return { mode, setupDone }
  }
}
