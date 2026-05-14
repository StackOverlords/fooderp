import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { eventBus } from '@/core/events/event-bus'
import { useAuthStore } from '@/core/auth/store'
import { confirm } from '@/core/confirm'
import { notify } from '@/core/notify'
import { extractApiMessage } from '@/core/http/error'
import { CategoryTable } from '@/features/menu/components/CategoryTable'
import { CategoryFormDialog } from '@/features/menu/components/CategoryFormDialog'
import { useDeactivateCategory } from '@/features/menu/api'
import type { Category } from '@/features/menu/schemas'

export default function MenuCategoriesPage() {
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))
  const deactivateMutation = useDeactivateCategory()

  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [categoryFormMode, setCategoryFormMode] = useState<'create' | 'edit'>('create')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

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

  async function handleDeactivate(category: Category) {
    const ok = await confirm({
      title: 'Desactivar categoría',
      description: `¿Desactivar "${category.name}"? Aparecerá como inactiva en el listado.`,
      confirmLabel: 'Desactivar',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      await deactivateMutation.mutateAsync(category.id)
      notify('Categoría desactivada correctamente', { type: 'success' })
    } catch (err) {
      notify(extractApiMessage(err), { type: 'error' })
    }
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

      <CategoryTable onEdit={handleEdit} onDeactivate={handleDeactivate} />

      <CategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        mode={categoryFormMode}
        category={selectedCategory}
      />
    </div>
  )
}
