import { useState } from 'react'
import { format } from 'date-fns'
import { DataTable, FilterBar, defineColumns, defineFilters } from '@/components/data-table'
import { useAuthStore } from '@/core/auth/store'
import { useMenuCategories } from '../api'
import { DishStatusBadge } from './DishStatusBadge'
import type { Category, CategoryFilters } from '../schemas'

interface CategoryTableProps {
  onEdit: (category: Category) => void
  onDeactivate: (category: Category) => void
}

export function CategoryTable({ onEdit, onDeactivate }: CategoryTableProps) {
  const [filters, setFilters] = useState<CategoryFilters>({})
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))
  const { data: categories = [], isLoading, isError } = useMenuCategories(filters)

  const sorted = [...categories].sort((a, b) => a.orderIndex - b.orderIndex)

  const columns = defineColumns<Category>([
    {
      id: 'orderIndex',
      header: 'Orden',
      accessorKey: 'orderIndex',
      size: 80,
    },
    {
      id: 'name',
      header: 'Nombre',
      accessorKey: 'name',
      size: 200,
    },
    {
      id: 'active',
      header: 'Estado',
      cell: (row) => <DishStatusBadge active={row.active} />,
      size: 110,
      enableSorting: false,
    },
    {
      id: 'createdAt',
      header: 'Creada',
      cell: (row) => format(row.createdAt, 'dd/MM/yyyy'),
      size: 110,
    },
  ])

  const filterDefs = defineFilters<CategoryFilters>([
    {
      id: 'activeOnly',
      type: 'boolean',
      label: 'Sólo activas',
    },
  ])

  function handleFilterChange(update: Partial<CategoryFilters>) {
    setFilters((prev) => ({ ...prev, ...update }))
  }

  const rowActions = isAdmin
    ? (category: Category) => [
        {
          label: 'Editar',
          onClick: () => onEdit(category),
        },
        {
          label: 'Desactivar',
          onClick: () => onDeactivate(category),
          variant: 'destructive' as const,
          disabled: (c: Category) => !c.active,
        },
      ]
    : undefined

  return (
    <DataTable
      tableId="menu-categories"
      columns={columns}
      data={sorted}
      isLoading={isLoading}
      isError={isError}
      emptyMessage="No hay categorías registradas."
      stickyHeader
      rowActions={rowActions}
      filterBar={
        <FilterBar
          defs={filterDefs}
          values={filters}
          onChange={handleFilterChange}
        />
      }
    />
  )
}
