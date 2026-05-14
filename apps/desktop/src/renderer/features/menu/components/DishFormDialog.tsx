import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { extractApiMessage } from '@/core/http/error'
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
  const [apiError, setApiError] = useState<string | null>(null)
  const createMutation = useCreateDish()
  const updateMutation = useUpdateDish()
  const { data: categories = [], isLoading: categoriesLoading } = useMenuCategories({ activeOnly: false })

  const isPending = createMutation.isPending || updateMutation.isPending

  const emptyValues: DishFormInput = {
    name: '', salePrice: 0, categoryId: '', description: '', imageUrl: '', availableFrom: '', availableTo: '',
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DishFormInput>({
    resolver: zodResolver(dishFormSchema),
    // `values` (not `defaultValues`) keeps the form reactive when `dish` changes between opens
    values: mode === 'edit' && dish
      ? {
          name:          dish.name,
          salePrice:     dish.salePrice,
          categoryId:    dish.categoryId ?? '',
          description:   dish.description ?? '',
          imageUrl:      dish.imageUrl ?? '',
          availableFrom: timeForInput(dish.availableFrom),
          availableTo:   timeForInput(dish.availableTo),
        }
      : emptyValues,
  })

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset()
      setApiError(null)
    }
    onOpenChange(isOpen)
  }

  async function onSubmit(data: DishFormInput): Promise<void> {
    setApiError(null)

    const payload: DishApiPayload = {
      name:          data.name,
      salePrice:     data.salePrice,
      categoryId:    data.categoryId || null,
      description:   data.description || null,
      imageUrl:      data.imageUrl || null,
      availableFrom: timeForApi(data.availableFrom),
      availableTo:   timeForApi(data.availableTo),
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
        notify('Plato creado correctamente', { type: 'success' })
      } else {
        if (!dish) return
        await updateMutation.mutateAsync({ id: dish.id, input: payload })
        notify('Plato actualizado correctamente', { type: 'success' })
      }
      handleClose(false)
    } catch (err) {
      setApiError(extractApiMessage(err))
    }
  }

  const title = mode === 'create' ? 'Nuevo plato' : 'Editar plato'
  const submitLabel = mode === 'create' ? 'Crear' : 'Guardar cambios'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="dish-name" className="text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </label>
            <Input
              id="dish-name"
              autoFocus
              placeholder="Ej: Pizza Margherita"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Precio */}
          <div className="space-y-1.5">
            <label htmlFor="dish-price" className="text-sm font-medium">
              Precio de venta <span className="text-destructive">*</span>
            </label>
            <Input
              id="dish-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('salePrice', { valueAsNumber: true })}
            />
            {errors.salePrice && (
              <p className="text-sm text-destructive">{errors.salePrice.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Categoría</label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? 'Cargando...' : 'Sin categoría'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin categoría</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label htmlFor="dish-description" className="text-sm font-medium">
              Descripción
            </label>
            <Textarea
              id="dish-description"
              placeholder="Descripción opcional del plato..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Imagen URL */}
          <div className="space-y-1.5">
            <label htmlFor="dish-image" className="text-sm font-medium">
              URL de imagen
            </label>
            <Input
              id="dish-image"
              type="url"
              placeholder="https://..."
              {...register('imageUrl')}
            />
            {errors.imageUrl && (
              <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Disponibilidad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="dish-from" className="text-sm font-medium">
                Disponible desde
              </label>
              <Input
                id="dish-from"
                type="time"
                {...register('availableFrom')}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="dish-to" className="text-sm font-medium">
                Disponible hasta
              </label>
              <Input
                id="dish-to"
                type="time"
                {...register('availableTo')}
              />
            </div>
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
