import { FormDialog, defineFields, FORM_NONE } from '@/components/schema-form'
import { notify } from '@/core/notify'
import { useCreateDish, useUpdateDish, useMenuCategories } from '../api'
import {
  dishFormSchema,
  timeForInput,
  timeForApi,
  type Dish,
  type DishFormInput,
  type DishApiPayload,
} from '../schemas'

interface DishFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  dish?: Dish | null
}

export function DishFormDialog({ open, onOpenChange, mode, dish }: DishFormDialogProps) {
  const createMutation = useCreateDish()
  const updateMutation = useUpdateDish()
  const { data: categories = [], isLoading: categoriesLoading } = useMenuCategories({ activeOnly: false })
  const isPending = createMutation.isPending || updateMutation.isPending

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }))

  const fields = defineFields<DishFormInput>([
    {
      id: 'name', type: 'text', label: 'Nombre',
      required: true, placeholder: 'Ej: Pizza Margherita', autoFocus: true,
    },
    {
      id: 'salePrice', type: 'number', label: 'Precio de venta',
      required: true, placeholder: '0.00', min: 0, step: 0.01,
    },
    {
      id: 'categoryId', type: 'select', label: 'Categoría',
      options: categoryOptions, loading: categoriesLoading,
      nullable: true, nullLabel: 'Sin categoría',
    },
    {
      id: 'description', type: 'textarea', label: 'Descripción',
      placeholder: 'Descripción opcional del plato...', rows: 3,
    },
    {
      id: 'imageUrl', type: 'url', label: 'URL de imagen',
      placeholder: 'https://...',
    },
    {
      id: 'availableFrom', type: 'time', label: 'Disponible desde',
      span: 1,
    },
    {
      id: 'availableTo', type: 'time', label: 'Disponible hasta',
      span: 1,
    },
  ])

  async function onSubmit(data: DishFormInput) {
    const payload: DishApiPayload = {
      name:          data.name,
      salePrice:     data.salePrice,
      categoryId:    !data.categoryId || data.categoryId === FORM_NONE ? null : data.categoryId,
      description:   data.description || null,
      imageUrl:      data.imageUrl || null,
      availableFrom: timeForApi(data.availableFrom),
      availableTo:   timeForApi(data.availableTo),
    }

    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
      notify('Plato creado correctamente', { type: 'success' })
    } else {
      if (!dish) return
      await updateMutation.mutateAsync({ id: dish.id, input: payload })
      notify('Plato actualizado correctamente', { type: 'success' })
    }
    onOpenChange(false)
  }

  return (
    <FormDialog<DishFormInput>
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Nuevo plato' : 'Editar plato'}
      fields={fields}
      schema={dishFormSchema}
      values={mode === 'edit' && dish ? {
        name:          dish.name,
        salePrice:     dish.salePrice,
        categoryId:    dish.categoryId ?? FORM_NONE,
        description:   dish.description ?? '',
        imageUrl:      dish.imageUrl ?? '',
        availableFrom: timeForInput(dish.availableFrom),
        availableTo:   timeForInput(dish.availableTo),
      } : undefined}
      defaultValues={mode === 'create' ? {
        name: '', salePrice: 0, categoryId: FORM_NONE,
        description: '', imageUrl: '', availableFrom: '', availableTo: '',
      } : undefined}
      onSubmit={onSubmit}
      isPending={isPending}
      submitLabel={mode === 'create' ? 'Crear' : 'Guardar cambios'}
      maxWidth="md"
    />
  )
}
