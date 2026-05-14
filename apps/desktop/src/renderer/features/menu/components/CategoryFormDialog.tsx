import { FormDialog, defineFields } from '@/components/schema-form'
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
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const isPending = createMutation.isPending || updateMutation.isPending

  const fields = defineFields<CategoryFormInput>([
    {
      id: 'name', type: 'text', label: 'Nombre',
      required: true, placeholder: 'Ej: Pizzas', autoFocus: true,
    },
    {
      id: 'orderIndex', type: 'number', label: 'Orden de visualización',
      required: true, placeholder: '0', min: 0, step: 1,
    },
  ])

  async function onSubmit(data: CategoryFormInput) {
    if (mode === 'create') {
      await createMutation.mutateAsync(data)
      notify('Categoría creada correctamente', { type: 'success' })
    } else {
      if (!category) return
      await updateMutation.mutateAsync({ id: category.id, input: data })
      notify('Categoría actualizada correctamente', { type: 'success' })
    }
    onOpenChange(false)
  }

  return (
    <FormDialog<CategoryFormInput>
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
      fields={fields}
      schema={categoryFormSchema}
      values={mode === 'edit' && category ? { name: category.name, orderIndex: category.orderIndex } : undefined}
      defaultValues={mode === 'create' ? { name: '', orderIndex: 0 } : undefined}
      onSubmit={onSubmit}
      isPending={isPending}
      submitLabel={mode === 'create' ? 'Crear' : 'Guardar cambios'}
    />
  )
}
