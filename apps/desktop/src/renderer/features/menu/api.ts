import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '@/core/http/client'
import { queryKeys } from '@/core/http/query-keys'
import { useAuthStore } from '@/core/auth/store'
import { eventBus } from '@/core/events/event-bus'
import {
  dishSchema,
  categorySchema,
  type Dish,
  type Category,
  type DishFilters,
  type CategoryFilters,
  type DishApiPayload,
  type CloneDishInput,
  type CategoryFormInput,
} from './schemas'

// ── Queries ────────────────────────────────────────────────────────────────────

export function useMenuDishes(filters?: DishFilters) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<Dish[]>({
    queryKey: queryKeys.menu.dishes(filters),
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.activeOnly) params.activeOnly = 'true'
      if (filters?.categoryId) params.categoryId = filters.categoryId
      if (filters?.availableAt) params.availableAt = filters.availableAt
      const { data } = await api.get<unknown>('/api/v1/dishes', { params })
      return z.array(dishSchema).parse(data)
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useMenuCategories(filters?: CategoryFilters) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<Category[]>({
    queryKey: queryKeys.menu.categories(filters),
    queryFn: async () => {
      const params = filters?.activeOnly ? { activeOnly: 'true' } : undefined
      const { data } = await api.get<unknown>('/api/v1/categories', { params })
      return z.array(categorySchema).parse(data)
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,   // categories rarely change
  })
}

// ── Dish mutations ─────────────────────────────────────────────────────────────

export function useCreateDish() {
  const qc = useQueryClient()
  return useMutation<Dish, unknown, DishApiPayload>({
    mutationFn: async (input) => {
      const { data } = await api.post<unknown>('/api/v1/dishes', input)
      return dishSchema.parse(data)
    },
    onSuccess: async (dish) => {
      await qc.invalidateQueries({ queryKey: queryKeys.menu.dishes() })
      eventBus.emit('menu.dish.created', { dishId: dish.id, name: dish.name })
    },
  })
}

export function useUpdateDish() {
  const qc = useQueryClient()
  return useMutation<Dish, unknown, { id: string; input: DishApiPayload }>({
    mutationFn: async ({ id, input }) => {
      const { data } = await api.put<unknown>(`/api/v1/dishes/${id}`, input)
      return dishSchema.parse(data)
    },
    onSuccess: async (dish) => {
      await qc.invalidateQueries({ queryKey: queryKeys.menu.dishes() })
      eventBus.emit('menu.dish.updated', { dishId: dish.id })
    },
  })
}

export function useDeactivateDish() {
  const qc = useQueryClient()
  return useMutation<Dish, unknown, string>({
    mutationFn: async (id) => {
      const { data } = await api.patch<unknown>(`/api/v1/dishes/${id}/deactivate`)
      return dishSchema.parse(data)
    },
    onSuccess: async (dish) => {
      await qc.invalidateQueries({ queryKey: queryKeys.menu.dishes() })
      eventBus.emit('menu.dish.deactivated', { dishId: dish.id })
    },
  })
}

export function useCloneDish() {
  const qc = useQueryClient()
  return useMutation<Dish, unknown, { id: string; input: CloneDishInput }>({
    mutationFn: async ({ id, input }) => {
      const { data } = await api.post<unknown>(`/api/v1/dishes/${id}/clone`, input)
      return dishSchema.parse(data)
    },
    onSuccess: async (dish) => {
      await qc.invalidateQueries({ queryKey: queryKeys.menu.dishes() })
      eventBus.emit('menu.dish.cloned', { dishId: dish.id, name: dish.name })
    },
  })
}

// ── Category mutations ─────────────────────────────────────────────────────────

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation<Category, unknown, CategoryFormInput>({
    mutationFn: async (input) => {
      const { data } = await api.post<unknown>('/api/v1/categories', input)
      return categorySchema.parse(data)
    },
    onSuccess: async (cat) => {
      await qc.invalidateQueries({ queryKey: queryKeys.menu.categories() })
      eventBus.emit('menu.category.created', { categoryId: cat.id, name: cat.name })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation<Category, unknown, { id: string; input: CategoryFormInput }>({
    mutationFn: async ({ id, input }) => {
      const { data } = await api.put<unknown>(`/api/v1/categories/${id}`, input)
      return categorySchema.parse(data)
    },
    onSuccess: async (cat) => {
      await qc.invalidateQueries({ queryKey: queryKeys.menu.categories() })
      eventBus.emit('menu.category.updated', { categoryId: cat.id })
    },
  })
}

export function useDeactivateCategory() {
  const qc = useQueryClient()
  return useMutation<Category, unknown, string>({
    mutationFn: async (id) => {
      const { data } = await api.patch<unknown>(`/api/v1/categories/${id}/deactivate`)
      return categorySchema.parse(data)
    },
    onSuccess: async (cat) => {
      await qc.invalidateQueries({ queryKey: queryKeys.menu.categories() })
      eventBus.emit('menu.category.deactivated', { categoryId: cat.id })
    },
  })
}
