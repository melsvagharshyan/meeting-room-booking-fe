import type { KeyboardEvent } from 'react'
import { Empty, Flex, Typography } from 'antd'
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import type { Booking } from '@/api/bookings-api-ts/types'
import { Button } from '@/components/Button'
import { formatDurationLabel } from '../utils/helpers'

type BookingListProps = {
  bookings: Booking[]
  selectedId?: string
  onEdit: (booking: Booking) => void
  onDelete: (booking: Booking) => void
  deletingId?: string | null
  readOnly?: boolean
}

export function BookingList({
  bookings,
  selectedId,
  onEdit,
  onDelete,
  deletingId,
  readOnly = false,
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="booking-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Flex vertical gap={4} align="center">
              <Typography.Text strong>No bookings</Typography.Text>
              <Typography.Text type="secondary">
                Free all day for this date.
              </Typography.Text>
            </Flex>
          }
        />
      </div>
    )
  }

  const handleItemActivate = (booking: Booking) => {
    if (readOnly) return
    onEdit(booking)
  }

  const handleItemKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    booking: Booking,
  ) => {
    if (readOnly) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onEdit(booking)
  }

  return (
    <Flex vertical gap={14} role="list" aria-label="Bookings list">
      {bookings.map((booking, index) => {
        const isSelected = booking.id === selectedId
        const duration = formatDurationLabel(booking.start, booking.end)

        return (
          <article
            key={booking.id}
            role="listitem"
            tabIndex={readOnly ? undefined : 0}
            className={[
              'booking-item',
              isSelected ? 'booking-item--selected' : '',
              readOnly ? 'booking-item--readonly' : 'booking-item--interactive',
            ].join(' ')}
            style={{ animationDelay: `${index * 40}ms` }}
            onClick={() => handleItemActivate(booking)}
            onKeyDown={(event) => handleItemKeyDown(event, booking)}
            aria-label={`${booking.title || 'Untitled booking'}, ${booking.start} to ${booking.end}`}
          >
            <div className="booking-item__accent" aria-hidden />

            <Flex
              align="center"
              justify="space-between"
              gap={16}
              className="booking-item__content"
            >
              <Flex align="center" gap={14} className="min-w-0 flex-1">
                <div className="booking-item__time" aria-hidden>
                  <ClockCircleOutlined />
                </div>

                <div className="min-w-0 text-left">
                  <Typography.Text strong ellipsis className="booking-item__title">
                    {booking.title || 'Untitled booking'}
                  </Typography.Text>

                  <Flex align="center" gap={8} wrap className="mt-2.5">
                    <span className="booking-chip booking-chip--time">
                      {booking.start} – {booking.end}
                    </span>
                    <span className="booking-chip booking-chip--duration">
                      {duration}
                    </span>
                  </Flex>
                </div>
              </Flex>

              {!readOnly ? (
                <Flex
                  gap={6}
                  className="booking-item__actions shrink-0"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(booking)}
                    aria-label={`Edit ${booking.title || 'booking'}`}
                    className="booking-item__action"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    danger
                    icon={<DeleteOutlined />}
                    loading={deletingId === booking.id}
                    onClick={() => onDelete(booking)}
                    aria-label={`Delete ${booking.title || 'booking'}`}
                    className="booking-item__action"
                  />
                </Flex>
              ) : null}
            </Flex>
          </article>
        )
      })}
    </Flex>
  )
}
