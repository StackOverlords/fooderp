import type { FieldValues, Path, DefaultValues } from 'react-hook-form'
import type { ZodType } from 'zod'

export const FORM_NONE = '__none__' as const

export interface FieldOption {
  label: string
  value: string
}

interface BaseFieldDef<T extends FieldValues> {
  id: Path<T>
  label: string
  required?: boolean
  placeholder?: string
  autoFocus?: boolean
  hidden?: boolean
  /** Columns to span within the form grid (default = cols, i.e. full width) */
  span?: number
}

export interface TextFieldDef<T extends FieldValues> extends BaseFieldDef<T> { type: 'text' }
export interface NumberFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: 'number'
  min?: number
  step?: number
}
export interface PasswordFieldDef<T extends FieldValues> extends BaseFieldDef<T> { type: 'password' }
export interface UrlFieldDef<T extends FieldValues> extends BaseFieldDef<T> { type: 'url' }
export interface TimeFieldDef<T extends FieldValues> extends BaseFieldDef<T> { type: 'time' }
export interface TextareaFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: 'textarea'
  rows?: number
  maxLength?: number
}
export interface SelectFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: 'select'
  options: FieldOption[]
  loading?: boolean
  nullable?: boolean
  nullLabel?: string
}
export interface SwitchFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: 'switch'
  description?: string
}

export type FieldDef<T extends FieldValues> =
  | TextFieldDef<T>
  | NumberFieldDef<T>
  | PasswordFieldDef<T>
  | UrlFieldDef<T>
  | TimeFieldDef<T>
  | TextareaFieldDef<T>
  | SelectFieldDef<T>
  | SwitchFieldDef<T>

export interface SchemaFormProps<T extends FieldValues> {
  fields: FieldDef<T>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<T, any>
  values?: T
  defaultValues?: DefaultValues<T>
  onSubmit: (data: T) => Promise<void>
  isPending?: boolean
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  /** Number of grid columns (default: 2) */
  cols?: number
}

export interface FormDialogProps<T extends FieldValues> extends SchemaFormProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  maxWidth?: 'sm' | 'md' | 'lg'
}
