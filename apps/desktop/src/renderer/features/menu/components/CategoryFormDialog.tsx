import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { extractApiMessage } from '@/core/http/error'
import { notify } from '@/core/notify'
import { useCreateCategory, useUpdateCategory } from '../api'
import { categoryFormSchema, type Category, type CategoryFormInput } from '../schemas'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  category?: Category | null
}

export function CategoryFormDialog({ open, onOpenChange, mode, category }: CategoryFormDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: mode === 'edit' && category
      ? {
          name:       category.name,
          orderIndex: category.orderIndex,
        }
      : {
          name:       '',
          orderIndex: 0,
        },
  })

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset()
      setApiError(null)
    }
    onOpenChange(isOpen)
  }

  async function onSubmit(data: CategoryFormInput): Promise<void> {
    setApiError(null)
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data)
        notify('Categoría creada correctamente', { type: 'success' })
      } else {
        if (!category) return
        await updateMutation.mutateAsync({ id: category.id, input: data })
        notify('Categoría actualizada correctamente', { type: 'success' })
      }
      handleClose(false)
    } catch (err) {
      setApiError(extractApiMessage(err))
    }
  }

  const title = mode === 'create' ? 'Nueva categoría' : 'Editar categoría'
  const submitLabel = mode === 'create' ? 'Crear' : 'Guardar cambios'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="cat-name" className="text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </label>
            <Input
              id="cat-name"
              autoFocus
              placeholder="Ej: Pizzas"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Orden */}
          <div className="space-y-1.5">
            <label htmlFor="cat-order" className="text-sm font-medium">
              Orden de visualización <span className="text-destructive">*</span>
            </label>
            <Input
              id="cat-order"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              {...register('orderIndex', { valueAsNumber: true })}
            />
            {errors.orderIndex && (
              <p className="text-sm text-destructive">{errors.orderIndex.message}</p>
            )}
          </div>

          {apiError && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              {apiError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
