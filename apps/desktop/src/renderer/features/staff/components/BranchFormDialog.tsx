import { useTranslation } from 'react-i18next'
import { FormDialog, defineFields } from '@/components/schema-form'
import { notify } from '@/core/notify'
import { useCreateBranch, useUpdateBranch } from '../api'
import { branchFormSchema, type Branch, type BranchFormInput } from '../schemas'

interface BranchFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  branch?: Branch | null
}

export function BranchFormDialog({ open, onOpenChange, mode, branch }: BranchFormDialogProps) {
  const { t } = useTranslation()
  const createMutation = useCreateBranch()
  const updateMutation = useUpdateBranch()

  const isPending = createMutation.isPending || updateMutation.isPending

  const fields = defineFields<BranchFormInput>([
    {
      id: 'name',
      type: 'text',
      label: t('staff.branches.form.name'),
      required: true,
      placeholder: 'ej: Centro',
      autoFocus: true,
    },
  ])

  async function onSubmit(data: BranchFormInput) {
    if (mode === 'create') {
      await createMutation.mutateAsync(data)
      notify(t('staff.branches.toast.created'), { type: 'success' })
    } else {
      if (!branch) return
      await updateMutation.mutateAsync({ id: branch.id, input: data })
      notify(t('staff.branches.toast.updated'), { type: 'success' })
    }
    onOpenChange(false)
  }

  return (
    <FormDialog<BranchFormInput>
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('staff.branches.form.createTitle') : t('staff.branches.form.editTitle')}
      fields={fields}
      schema={branchFormSchema}
      values={mode === 'edit' && branch ? { name: branch.name } : undefined}
      defaultValues={mode === 'create' ? { name: '' } : undefined}
      onSubmit={onSubmit}
      isPending={isPending}
      submitLabel={mode === 'create' ? t('staff.branches.form.submitCreate') : t('staff.branches.form.submitEdit')}
      cancelLabel={t('common.cancel')}
    />
  )
}
