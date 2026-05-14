import { useState, useEffect } from 'react'
import type { FieldValues } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SchemaForm } from './schema-form'
import type { FormDialogProps } from './types'

const MAX_WIDTH = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
} as const

export function FormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  maxWidth = 'sm',
  ...formProps
}: FormDialogProps<T>) {
  // Increment on every open so SchemaForm remounts with fresh state
  const [mountKey, setMountKey] = useState(0)
  useEffect(() => {
    if (open) setMountKey((k) => k + 1)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MAX_WIDTH[maxWidth]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SchemaForm
          key={mountKey}
          {...formProps}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
