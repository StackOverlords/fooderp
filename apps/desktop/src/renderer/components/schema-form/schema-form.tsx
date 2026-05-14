import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Path, FieldErrors, Resolver } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { extractApiMessage } from '@/core/http/error'
import { FORM_NONE } from './types'
import type {
  FieldDef,
  SelectFieldDef,
  TextareaFieldDef,
  SwitchFieldDef,
  SchemaFormProps,
} from './types'

// ─── Field wrapper ────────────────────────────────────────────────────────────

function FieldWrapper({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ─── Field renderers ──────────────────────────────────────────────────────────

function SelectRenderer<T extends FieldValues>({
  field,
  control,
  disabled,
  error,
}: {
  field: SelectFieldDef<T>
  control: ReturnType<typeof useForm<T>>['control']
  disabled: boolean
  error?: string
}) {
  return (
    <FieldWrapper id={field.id} label={field.label} required={field.required} error={error}>
      <Controller
        control={control}
        name={field.id as Path<T>}
        render={({ field: f }) => {
          const isNone = !f.value || f.value === FORM_NONE
          const selectedLabel = field.options.find((o) => o.value === f.value)?.label
          return (
            <Select value={f.value} onValueChange={f.onChange} disabled={disabled || field.loading}>
              <SelectTrigger>
                <SelectValue>
                  {field.loading
                    ? 'Cargando...'
                    : isNone
                      ? (field.nullLabel ?? field.placeholder ?? 'Seleccionar...')
                      : (selectedLabel ?? f.value)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {field.nullable && (
                  <SelectItem value={FORM_NONE}>{field.nullLabel ?? 'Ninguno'}</SelectItem>
                )}
                {field.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }}
      />
    </FieldWrapper>
  )
}

function SwitchRenderer<T extends FieldValues>({
  field,
  control,
  disabled,
  error,
}: {
  field: SwitchFieldDef<T>
  control: ReturnType<typeof useForm<T>>['control']
  disabled: boolean
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Controller
        control={control}
        name={field.id as Path<T>}
        render={({ field: f }) => (
          <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
            <div className="space-y-0.5">
              <label htmlFor={field.id} className="text-sm font-medium cursor-pointer">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Switch
              id={field.id}
              checked={!!f.value}
              onCheckedChange={f.onChange}
              disabled={disabled}
            />
          </div>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function renderField<T extends FieldValues>(
  field: FieldDef<T>,
  form: ReturnType<typeof useForm<T>>,
  disabled: boolean,
) {
  if (field.hidden) return null

  const errors = form.formState.errors as FieldErrors<Record<string, unknown>>
  const error = errors[field.id]?.message as string | undefined

  if (field.type === 'select') {
    return (
      <SelectRenderer
        key={field.id}
        field={field}
        control={form.control}
        disabled={disabled}
        error={error}
      />
    )
  }

  if (field.type === 'switch') {
    return (
      <SwitchRenderer
        key={field.id}
        field={field}
        control={form.control}
        disabled={disabled}
        error={error}
      />
    )
  }

  if (field.type === 'textarea') {
    const f = field as TextareaFieldDef<T>
    return (
      <FieldWrapper key={field.id} id={field.id} label={field.label} required={field.required} error={error}>
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          rows={f.rows ?? 3}
          maxLength={f.maxLength}
          disabled={disabled}
          autoFocus={field.autoFocus}
          {...form.register(field.id as Path<T>)}
        />
      </FieldWrapper>
    )
  }

  // text | number | password | url | time
  const registerOptions =
    field.type === 'number' ? ({ valueAsNumber: true } as Parameters<typeof form.register>[1]) : {}

  return (
    <FieldWrapper key={field.id} id={field.id} label={field.label} required={field.required} error={error}>
      <Input
        id={field.id}
        type={field.type}
        placeholder={field.placeholder}
        autoFocus={field.autoFocus}
        min={field.type === 'number' ? (field as { min?: number }).min : undefined}
        step={field.type === 'number' ? (field as { step?: number }).step : undefined}
        disabled={disabled}
        {...form.register(field.id as Path<T>, registerOptions)}
      />
    </FieldWrapper>
  )
}

// ─── Grid wrapper ─────────────────────────────────────────────────────────────

// Tailwind needs static class names — map col count to grid class
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

// Map span number to Tailwind col-span class
const COL_SPAN: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
}

// ─── SchemaForm ───────────────────────────────────────────────────────────────

export function SchemaForm<T extends FieldValues>({
  fields,
  schema,
  values,
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  onCancel,
  cols = 2,
}: SchemaFormProps<T>) {
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<T>({
    resolver: zodResolver(schema) as Resolver<T>,
    values,
    defaultValues,
  })

  const { isSubmitting } = form.formState
  const isBusy = isSubmitting || (isPending ?? false)

  async function handleFormSubmit(data: T) {
    setApiError(null)
    try {
      await onSubmit(data)
    } catch (err) {
      setApiError(extractApiMessage(err))
    }
  }

  const gridClass = GRID_COLS[cols] ?? 'grid-cols-2'

  return (
    <form
      onSubmit={form.handleSubmit(handleFormSubmit as Parameters<typeof form.handleSubmit>[0])}
      className="space-y-4"
    >
      <div className={`grid ${gridClass} gap-4`}>
        {fields.map((field) => {
          if (field.hidden) return null
          const span = field.span ?? cols
          const spanClass = COL_SPAN[span] ?? `col-span-${cols}`
          return (
            <div key={field.id} className={spanClass}>
              {renderField(field, form, isBusy)}
            </div>
          )
        })}
      </div>

      {apiError && (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{apiError}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isBusy}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isBusy}>
          {isBusy ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
