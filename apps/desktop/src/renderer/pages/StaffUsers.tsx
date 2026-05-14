import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { eventBus } from '@/core/events/event-bus'
import { useAuthStore } from '@/core/auth/store'
import { confirm } from '@/core/confirm'
import { notify } from '@/core/notify'
import { extractApiMessage } from '@/core/http/error'
import { UserTable } from '@/features/staff/components/UserTable'
import { UserFormDialog } from '@/features/staff/components/UserFormDialog'
import { useDeleteUser } from '@/features/staff/api'
import type { User } from '@/features/staff/schemas'

export default function StaffUsersPage() {
  const { t } = useTranslation()
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))
  const deleteMutation = useDeleteUser()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = eventBus.on('staff.userDialog.requested', ({ mode }) => {
      setFormMode(mode)
      setSelectedUser(null)
      setFormOpen(true)
    })
    return unsub
  }, [])

  function handleEdit(user: User) {
    setSelectedUser(user)
    setFormMode('edit')
    setFormOpen(true)
  }

  async function handleDelete(user: User) {
    const ok = await confirm({
      title: t('staff.users.delete.title'),
      description: t('staff.users.delete.description', { username: user.username }),
      confirmLabel: t('staff.users.delete.submit'),
      variant: 'destructive',
    })
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(user.id)
      notify(t('staff.users.toast.deleted'), { type: 'success' })
    } catch (err) {
      notify(extractApiMessage(err), { type: 'error' })
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('staff.users.title')}</h1>
      </div>

      {isAdmin && (
        <UserTable onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        user={selectedUser}
      />
    </div>
  )
}
