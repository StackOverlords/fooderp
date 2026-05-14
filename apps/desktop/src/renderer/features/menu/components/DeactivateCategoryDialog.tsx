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
import { useDeactivateCategory } from '../api'
import type { Category } from '../schemas'

interface DeactivateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
}

export function DeactivateCategoryDialog({ open, onOpenChange, category }: DeactivateCategoryDialogProps) {
  const mutation = useDeactivateCategory()

  async function handleConfirm() {
    if (!category) return
    try {
      await mutation.mutateAsync(category.id)
      notify('Categoría desactivada correctamente', { type: 'success' })
      onOpenChange(false)
    } catch (err) {
      notify(extractApiMessage(err), { type: 'error' })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Desactivar categoría</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Desactivar <strong>{category?.name}</strong>? Aparecerá como inactiva en el listado.
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
