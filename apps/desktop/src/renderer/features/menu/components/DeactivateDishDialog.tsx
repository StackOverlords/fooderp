import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { notify } from '@/core/notify'
import { extractApiMessage } from '@/core/http/error'
import { useDeactivateDish } from '../api'
import type { Dish } from '../schemas'

interface DeactivateDishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dish: Dish | null
}

export function DeactivateDishDialog({ open, onOpenChange, dish }: DeactivateDishDialogProps) {
  const mutation = useDeactivateDish()

  async function handleConfirm() {
    if (!dish) return
    try {
      await mutation.mutateAsync(dish.id)
      notify('Plato desactivado correctamente', { type: 'success' })
      onOpenChange(false)
    } catch (err) {
      notify(extractApiMessage(err), { type: 'error' })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Desactivar plato</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Desactivar <strong>{dish?.name}</strong>? Aparecerá como inactivo en el listado y
            dejará de mostrarse a los cajeros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Desactivando...' : 'Desactivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
