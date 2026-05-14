import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { useCloneDish } from '../api'
import type { Dish } from '../schemas'

interface CloneDishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dish: Dish | null
}

const cloneFormSchema = z.object({
  name: z.string().min(1, 'Requerido').max(120),
})
type CloneFormInput = z.infer<typeof cloneFormSchema>

export function CloneDishDialog({ open, onOpenChange, dish }: CloneDishDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = useCloneDish()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloneFormInput>({
    resolver: zodResolver(cloneFormSchema),
    values: {
      name: dish?.name ? `${dish.name} (copia)` : '',
    },
  })

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset()
      setApiError(null)
    }
    onOpenChange(isOpen)
  }

  async function onSubmit(data: CloneFormInput): Promise<void> {
    if (!dish) return
    setApiError(null)
    try {
      await mutation.mutateAsync({ id: dish.id, input: { name: data.name } })
      notify(`"${data.name}" creado correctamente`, { type: 'success' })
      handleClose(false)
    } catch (err) {
      setApiError(extractApiMessage(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Clonar plato</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="clone-name" className="text-sm font-medium">
              Nombre del nuevo plato
            </label>
            <Input
              id="clone-name"
              autoFocus
              placeholder="Nombre del clon..."
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Clonando...' : 'Clonar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
