import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Card, Col, Flex, Row, Typography } from 'antd'
import type { Booking } from '@/api/bookings-api-ts/types'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import {
  buildTimeOptions,
  canSelectEnd,
  canSelectStart,
  getDefaultEndTime,
} from '../utils/helpers'
import { createBookingFormSchema } from '../utils/validations'
import type { BookingFormValues } from '../utils/types'
import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  WORK_DAY_END,
  WORK_DAY_START,
} from '../utils/constants'

type BookingFormProps = {
  mode: 'create' | 'edit'
  date: string
  bookings: Booking[]
  excludeId?: string
  defaultValues: BookingFormValues
  serverError: string | null
  isSubmitting: boolean
  onSubmit: (values: BookingFormValues) => Promise<void>
  onCancel: () => void
}

export function BookingForm({
  mode,
  date,
  bookings,
  excludeId,
  defaultValues,
  serverError,
  isSubmitting,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const originalStart = mode === 'edit' ? defaultValues.start : undefined

  const schema = useMemo(
    () =>
      createBookingFormSchema({
        date,
        bookings,
        excludeId,
        originalStart,
      }),
    [date, bookings, excludeId, originalStart],
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting: formSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const start = useWatch({ control, name: 'start' })
  const end = useWatch({ control, name: 'end' })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    if (!start || !end) return
    if (!canSelectEnd(start, end)) {
      setValue('end', getDefaultEndTime(start), { shouldValidate: true })
    }
  }, [start, end, setValue])

  const timeOptions = buildTimeOptions().map((time) => ({
    value: time,
    label: time,
  }))

  const startOptions = timeOptions.map((option) => ({
    ...option,
    disabled: !canSelectStart(date, option.value, {
      allowStart: originalStart,
    }),
  }))

  const endOptions = timeOptions.map((option) => ({
    ...option,
    disabled: !start || !canSelectEnd(start, option.value),
  }))

  const submitting = isSubmitting || formSubmitting

  return (
    <Card
      title={mode === 'create' ? 'New booking' : 'Edit booking'}
      className="h-full shadow-sm"
    >
      <Typography.Paragraph type="secondary" className="!mt-0">
        {WORK_DAY_START}–{WORK_DAY_END} · {MIN_DURATION_MINUTES}–
        {MAX_DURATION_MINUTES} min · back-to-back slots are fine
      </Typography.Paragraph>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Flex vertical gap={16}>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Title (optional)"
                placeholder="Team standup"
                error={fieldState.error?.message}
                allowClear
              />
            )}
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Controller
                name="start"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    label="Start"
                    options={startOptions}
                    error={fieldState.error?.message}
                    placeholder="Start time"
                  />
                )}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Controller
                name="end"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    label="End"
                    options={endOptions}
                    error={fieldState.error?.message}
                    placeholder="End time"
                  />
                )}
              />
            </Col>
          </Row>

          {serverError ? (
            <Alert type="error" showIcon message={serverError} />
          ) : null}

          <Flex gap={8} wrap="wrap">
            <Button
              type="submit"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
            >
              {mode === 'create' ? 'Create booking' : 'Save changes'}
            </Button>
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  )
}
