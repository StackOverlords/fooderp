import type { FieldValues } from 'react-hook-form'
import type { FieldDef } from './types'

export function defineFields<T extends FieldValues>(fields: FieldDef<T>[]): FieldDef<T>[] {
  return fields
}
