import { Modal, Typography } from 'antd'
import type { Booking } from '@/api/bookings-api-ts/types'

type DeleteConfirmDialogProps = {
  booking: Booking
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  booking,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Modal
      open
      title="Delete booking?"
      okText="Delete"
      okButtonProps={{ danger: true, loading: isDeleting }}
      cancelButtonProps={{ disabled: isDeleting }}
      onOk={onConfirm}
      onCancel={onCancel}
      centered
      destroyOnHidden
    >
      <Typography.Paragraph className="!mb-0">
        “{booking.title || 'Untitled booking'}” ({booking.start}–{booking.end})
        will be removed. This cannot be undone.
      </Typography.Paragraph>
    </Modal>
  )
}
