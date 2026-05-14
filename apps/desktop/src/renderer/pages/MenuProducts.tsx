import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { eventBus } from '@/core/events/event-bus'
import { useAuthStore } from '@/core/auth/store'
import { DishTable } from '@/features/menu/components/DishTable'
import { DishFormDialog } from '@/features/menu/components/DishFormDialog'
import { CloneDishDialog } from '@/features/menu/components/CloneDishDialog'
import { DeactivateDishDialog } from '@/features/menu/components/DeactivateDishDialog'
import type { Dish } from '@/features/menu/schemas'

export default function MenuProductsPage() {
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))

  const [dishFormOpen, setDishFormOpen] = useState(false)
  const [dishFormMode, setDishFormMode] = useState<'create' | 'edit'>('create')
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
  const [cloneTargetDish, setCloneTargetDish] = useState<Dish | null>(null)

  const [deactivateDishOpen, setDeactivateDishOpen] = useState(false)
  const [deactivateTargetDish, setDeactivateTargetDish] = useState<Dish | null>(null)

  useEffect(() => {
    const unsub = eventBus.on('menu.dishDialog.requested', ({ mode, dishId: _dishId }) => {
      setDishFormMode(mode)
      setSelectedDish(null)
      setDishFormOpen(true)
    })
    return unsub
  }, [])

  function handleEdit(dish: Dish) {
    setSelectedDish(dish)
    setDishFormMode('edit')
    setDishFormOpen(true)
  }

  function handleClone(dish: Dish) {
    setCloneTargetDish(dish)
    setCloneDialogOpen(true)
  }

  function handleDeactivate(dish: Dish) {
    setDeactivateTargetDish(dish)
    setDeactivateDishOpen(true)
  }

  function handleNewDish() {
    setSelectedDish(null)
    setDishFormMode('create')
    setDishFormOpen(true)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Productos</h1>
        {isAdmin && (
          <Button onClick={handleNewDish} size="sm">
            Nuevo plato
          </Button>
        )}
      </div>

      <DishTable
        onEdit={handleEdit}
        onClone={handleClone}
        onDeactivate={handleDeactivate}
      />

      <DishFormDialog
        open={dishFormOpen}
        onOpenChange={setDishFormOpen}
        mode={dishFormMode}
        dish={selectedDish}
      />

      <CloneDishDialog
        open={cloneDialogOpen}
        onOpenChange={setCloneDialogOpen}
        dish={cloneTargetDish}
      />

      <DeactivateDishDialog
        open={deactivateDishOpen}
        onOpenChange={setDeactivateDishOpen}
        dish={deactivateTargetDish}
      />
    </div>
  )
}
