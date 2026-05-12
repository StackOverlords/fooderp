import type { ISupplyTransferRepository, ReceiveItemData } from '../../domain/repositories/i-supply-transfer-repository'
import type { SupplyTransferWithItems } from '../../domain/entities/supply-transfer'
import { SupplyTransferStatus } from '../../domain/entities/supply-transfer'
import { Errors } from '../../shared/errors/app-error'

interface Dependencies {
  supplyTransferRepository: ISupplyTransferRepository
}

interface ReceiveInput {
  transferId: string
  receivingBranchId: string
  items: { supplyType: string; quantityReceived: number; notes?: string | null }[]
  notes?: string | null
}

export function createReceiveSupplyTransferUseCase({ supplyTransferRepository }: Dependencies) {
  return async function receiveSupplyTransfer(input: ReceiveInput): Promise<SupplyTransferWithItems> {
    const transfer = await supplyTransferRepository.findById(input.transferId)
    if (!transfer) throw Errors.notFound(`Envío '${input.transferId}' no encontrado`)

    if (transfer.toBranchId !== input.receivingBranchId) {
      throw Errors.forbidden('Only the destination branch can confirm receipt')
    }
    if (transfer.status !== SupplyTransferStatus.IN_TRANSIT) {
      throw Errors.badRequest('Transfer has already been received or is not in transit')
    }
    if (!input.items || input.items.length === 0) {
      throw Errors.badRequest('Must confirm at least one dough type')
    }

    const hasDifference = input.items.some(inputItem => {
      const sent = transfer.items.find(s => s.supplyType === inputItem.supplyType)
      return sent && sent.quantitySent !== inputItem.quantityReceived
    })

    if (hasDifference && !input.notes) {
      throw Errors.badRequest('An observation is required when sent and received quantities differ')
    }

    const receiveItems: ReceiveItemData[] = input.items.map(i => ({
      supplyType: i.supplyType,
      quantityReceived: i.quantityReceived,
      notes: i.notes ?? null,
    }))

    return supplyTransferRepository.receive(input.transferId, receiveItems, input.notes ?? null)
  }
}
