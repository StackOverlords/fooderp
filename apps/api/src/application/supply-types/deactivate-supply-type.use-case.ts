import type { ISupplyTypeRepository } from '../../domain/repositories/i-supply-type-repository'
import type { SupplyType } from '../../domain/entities/supply-type'
import { Errors } from '../../shared/errors/app-error'

interface Dependencies {
  supplyTypeRepository: ISupplyTypeRepository
}

export function createDeactivateSupplyTypeUseCase({ supplyTypeRepository }: Dependencies) {
  return async function deactivateSupplyType(id: string): Promise<SupplyType> {
    const current = await supplyTypeRepository.findById(id)
    if (!current) throw Errors.notFound('Supply type not found')
    if (!current.active) throw Errors.conflict('Supply type is already inactive')
    return supplyTypeRepository.deactivate(id)
  }
}
