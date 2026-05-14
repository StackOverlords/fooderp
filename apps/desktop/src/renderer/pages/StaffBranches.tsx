import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { eventBus } from '@/core/events/event-bus'
import { useAuthStore } from '@/core/auth/store'
import { confirm } from '@/core/confirm'
import { notify } from '@/core/notify'
import { extractApiMessage } from '@/core/http/error'
import { BranchTable } from '@/features/staff/components/BranchTable'
import { BranchFormDialog } from '@/features/staff/components/BranchFormDialog'
import { useDeleteBranch } from '@/features/staff/api'
import type { Branch } from '@/features/staff/schemas'

export default function StaffBranchesPage() {
  const { t } = useTranslation()
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))
  const deleteMutation = useDeleteBranch()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  useEffect(() => {
    const unsub = eventBus.on('staff.branchDialog.requested', ({ mode }) => {
      setFormMode(mode)
      setSelectedBranch(null)
      setFormOpen(true)
    })
    return unsub
  }, [])

  function handleEdit(branch: Branch) {
    setSelectedBranch(branch)
    setFormMode('edit')
    setFormOpen(true)
  }

  async function handleDelete(branch: Branch) {
    const ok = await confirm({
      title: t('staff.branches.delete.title'),
      description: (
        <div className="space-y-3">
          <p>{t('staff.branches.delete.description', { name: branch.name })}</p>
          <p className="flex items-start gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{t('staff.branches.delete.warning')}</span>
          </p>
        </div>
      ),
      confirmLabel: t('staff.branches.delete.submit'),
      variant: 'destructive',
    })
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(branch.id)
      notify(t('staff.branches.toast.deleted'), { type: 'success' })
    } catch (err) {
      notify(extractApiMessage(err), { type: 'error' })
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('staff.branches.title')}</h1>
      </div>

      {isAdmin && (
        <BranchTable onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <BranchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        branch={selectedBranch}
      />
    </div>
  )
}
