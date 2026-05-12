import type { IDoughTransferRepository, CreateDoughTransferData } from '../../domain/repositories/i-dough-transfer-repository'
import type { DoughTransferWithItems } from '../../domain/entities/dough-transfer'
import { Errors } from '../../shared/errors/app-error'

interface Dependencies {
  doughTransferRepository: IDoughTransferRepository
}

interface CreateDoughTransferInput {
  fromBranchId: string
  toBranchId: string
  sentByUserId: string
  transferDate: string
  notes?: string | null
  items: { doughType: string; quantitySent: number; notes?: string | null }[]
}

export function createCreateDoughTransferUseCase({ doughTransferRepository }: Dependencies) {
  return async function createDoughTransfer(input: CreateDoughTransferInput): Promise<DoughTransferWithItems> {
    if (input.fromBranchId === input.toBranchId) {
      throw Errors.badRequest('Destination branch must differ from origin branch')
    }
    if (!input.items || input.items.length === 0) {
      throw Errors.badRequest('Must include at least one dough type')
    }
    for (const item of input.items) {
      if (item.quantitySent <= 0) {
        throw Errors.badRequest('Sent quantity must be greater than 0')
      }
    }

    const data: CreateDoughTransferData = {
      fromBranchId: input.fromBranchId,
      toBranchId: input.toBranchId,
      sentByUserId: input.sentByUserId,
      transferDate: new Date(input.transferDate),
      notes: input.notes ?? null,
      items: input.items.map(i => ({
        doughType: i.doughType as CreateDoughTransferData['items'][0]['doughType'],
        quantitySent: i.quantitySent,
        notes: i.notes ?? null,
      })),
    }

    return doughTransferRepository.create(data)
  }
}
