import { useTranslation } from 'react-i18next'
import { FormDialog, defineFields } from '@/components/schema-form'
import { useOpenShift } from '../api'
import { openShiftInputSchema, type OpenShiftInput } from '../schemas'

interface OpenShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OpenShiftDialog({ open, onOpenChange }: OpenShiftDialogProps) {
  const { t } = useTranslation()
  const mutation = useOpenShift()

  const fields = defineFields<OpenShiftInput>([
    {
      id: 'initialCash', type: 'number', label: t('shifts.open.initialCash'),
      min: 0, step: 0.01, autoFocus: true,
    },
  ])

  async function onSubmit(data: OpenShiftInput) {
    await mutation.mutateAsync(data)
    onOpenChange(false)
  }

  return (
    <FormDialog<OpenShiftInput>
      open={open}
      onOpenChange={onOpenChange}
      title={t('shifts.open.title')}
      fields={fields}
      schema={openShiftInputSchema}
      defaultValues={{ initialCash: 0 }}
      onSubmit={onSubmit}
      isPending={mutation.isPending}
      submitLabel={t('shifts.open.submit')}
      cancelLabel={t('confirm.cancel')}
    />
  )
}
