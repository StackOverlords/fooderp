import { z } from 'zod'
import { FormDialog, defineFields } from '@/components/schema-form'
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
  const mutation = useCloneDish()

  const fields = defineFields<CloneFormInput>([
    {
      id: 'name', type: 'text', label: 'Nombre del nuevo plato',
      placeholder: 'Nombre del clon...', autoFocus: true,
    },
  ])

  async function onSubmit(data: CloneFormInput) {
    if (!dish) return
    await mutation.mutateAsync({ id: dish.id, input: { name: data.name } })
    notify(`"${data.name}" creado correctamente`, { type: 'success' })
    onOpenChange(false)
  }

  return (
    <FormDialog<CloneFormInput>
      open={open}
      onOpenChange={onOpenChange}
      title="Clonar plato"
      fields={fields}
      schema={cloneFormSchema}
      values={{ name: dish?.name ? `${dish.name} (copia)` : '' }}
      onSubmit={onSubmit}
      isPending={mutation.isPending}
      submitLabel="Clonar"
    />
  )
}
