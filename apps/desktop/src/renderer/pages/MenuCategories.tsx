import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { eventBus } from '@/core/events/event-bus'
import { useAuthStore } from '@/core/auth/store'
import { CategoryTable } from '@/features/menu/components/CategoryTable'
import { CategoryFormDialog } from '@/features/menu/components/CategoryFormDialog'
import { DeactivateCategoryDialog } from '@/features/menu/components/DeactivateCategoryDialog'
import type { Category } from '@/features/menu/schemas'

export default function MenuCategoriesPage() {
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))

  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [categoryFormMode, setCategoryFormMode] = useState<'create' | 'edit'>('create')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const [deactivateCategoryOpen, setDeactivateCategoryOpen] = useState(false)
  const [deactivateTargetCategory, setDeactivateTargetCategory] = useState<Category | null>(null)

  useEffect(() => {
    const unsub = eventBus.on('menu.categoryDialog.requested', ({ mode }) => {
      setCategoryFormMode(mode)
      setSelectedCategory(null)
      setCategoryFormOpen(true)
    })
    return unsub
  }, [])

  function handleEdit(category: Category) {
    setSelectedCategory(category)
    setCategoryFormMode('edit')
    setCategoryFormOpen(true)
  }

  function handleDeactivate(category: Category) {
    setDeactivateTargetCategory(category)
    setDeactivateCategoryOpen(true)
  }

  function handleNewCategory() {
    setSelectedCategory(null)
    setCategoryFormMode('create')
    setCategoryFormOpen(true)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Categorías</h1>
        {isAdmin && (
          <Button onClick={handleNewCategory} size="sm">
            Nueva categoría
          </Button>
        )}
      </div>

      <CategoryTable
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
      />

      <CategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        mode={categoryFormMode}
        category={selectedCategory}
      />

      <DeactivateCategoryDialog
        open={deactivateCategoryOpen}
        onOpenChange={setDeactivateCategoryOpen}
        category={deactivateTargetCategory}
      />
    </div>
  )
}
