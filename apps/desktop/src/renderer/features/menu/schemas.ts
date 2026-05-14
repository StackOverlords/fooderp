import { z } from 'zod'

// ── Entities ───────────────────────────────────────────────────────────────────

export const dishSchema = z.object({
  id:            z.string(),
  categoryId:    z.string().nullable(),
  name:          z.string(),
  description:   z.string().nullable(),
  salePrice:     z.number(),
  imageUrl:      z.string().nullable(),
  active:        z.boolean(),
  availableFrom: z.string().nullable(),   // "HH:MM:SS" from API — kept as-is
  availableTo:   z.string().nullable(),
  createdAt:     z.coerce.date(),
  updatedAt:     z.coerce.date(),
})
export type Dish = z.infer<typeof dishSchema>

export const categorySchema = z.object({
  id:         z.string(),
  name:       z.string(),
  orderIndex: z.number().int(),
  active:     z.boolean(),
  createdAt:  z.coerce.date(),
})
export type Category = z.infer<typeof categorySchema>

// ── Filters ────────────────────────────────────────────────────────────────────

export const dishFiltersSchema = z.object({
  activeOnly:  z.boolean().optional(),
  categoryId:  z.string().optional(),
  availableAt: z.string().optional(),   // "HH:MM"
})
export type DishFilters = z.infer<typeof dishFiltersSchema>

export const categoryFiltersSchema = z.object({
  activeOnly: z.boolean().optional(),
})
export type CategoryFilters = z.infer<typeof categoryFiltersSchema>

// ── Form input schemas ─────────────────────────────────────────────────────────

export const dishFormSchema = z.object({
  name:          z.string().min(1, 'Requerido').max(120),
  salePrice:     z.number({ message: 'Requerido' }).finite().positive('Debe ser mayor a 0'),
  categoryId:    z.string().nullable().optional(),
  description:   z.string().max(500).nullable().optional(),
  imageUrl:      z.string().url('URL inválida').or(z.literal('')).nullable().optional(),
  availableFrom: z.string().nullable().optional(),   // "HH:MM" from <Input type="time">
  availableTo:   z.string().nullable().optional(),
})
export type DishFormInput = z.infer<typeof dishFormSchema>

// Used to construct API request bodies from form output
export interface DishApiPayload {
  name:           string
  salePrice:      number
  categoryId?:    string | null
  description?:   string | null
  imageUrl?:      string | null
  availableFrom?: string | null   // "HH:MM:SS"
  availableTo?:   string | null
}

export const categoryFormSchema = z.object({
  name:       z.string().min(1, 'Requerido').max(80),
  orderIndex: z.number({ message: 'Requerido' }).int().nonnegative(),
})
export type CategoryFormInput = z.infer<typeof categoryFormSchema>

export const cloneDishInputSchema = z.object({
  name: z.string().min(1).max(120).optional(),
})
export type CloneDishInput = z.infer<typeof cloneDishInputSchema>

// ── Time round-trip helpers ────────────────────────────────────────────────────

/**
 * Converts API time "HH:MM:SS" → "HH:MM" for <Input type="time">.
 * null/undefined/empty → "".
 */
export function timeForInput(value: string | null | undefined): string {
  if (!value) return ''
  return value.length >= 5 ? value.slice(0, 5) : value
}

/**
 * Converts <Input type="time"> "HH:MM" → "HH:MM:00" for the API.
 * "" or null/undefined → null.
 * Already "HH:MM:SS" → unchanged.
 */
export function timeForApi(value: string | null | undefined): string | null {
  if (!value) return null
  if (value.length === 5) return `${value}:00`
  return value
}
