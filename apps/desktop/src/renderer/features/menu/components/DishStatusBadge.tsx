import { Badge } from '@/components/ui/badge'

interface DishStatusBadgeProps {
  active: boolean
}

export function DishStatusBadge({ active }: DishStatusBadgeProps) {
  if (active) {
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
      >
        Activo
      </Badge>
    )
  }
  return (
    <Badge variant="secondary">
      Inactivo
    </Badge>
  )
}
