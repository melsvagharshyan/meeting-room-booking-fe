import { DatePicker, Flex, Space, Typography } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { Button } from '@/components/Button'
import { formatDateLabel } from '../utils/helpers'
import { getTodayDateString } from '@/mocks/bookings/time'

type DateToolbarProps = {
  selectedDate: string
  onDateChange: (date: string) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export function DateToolbar({
  selectedDate,
  onDateChange,
  onPrevious,
  onNext,
  onToday,
}: DateToolbarProps) {
  const isToday = selectedDate === getTodayDateString()

  const handleDateChange = (value: Dayjs | null) => {
    if (!value) return
    onDateChange(value.format('YYYY-MM-DD'))
  }

  return (
    <Flex
      justify="space-between"
      align="center"
      gap={24}
      wrap="wrap"
      className="w-full"
    >
      <div className="min-w-[240px] flex-1 text-left">
        <Typography.Text
          type="secondary"
          className="!text-xs !font-semibold !tracking-wide !uppercase"
        >
          Meeting room
        </Typography.Text>
        <Typography.Title level={2} className="!mb-1 !mt-1 !font-display">
          {formatDateLabel(selectedDate)}
        </Typography.Title>
        <Typography.Text type="secondary">
          Working hours 09:00–18:00 · 30 min–2 hours
        </Typography.Text>
      </div>

      <Space size={12} wrap className="ms-auto">
        <Space.Compact>
          <Button
            variant="secondary"
            onClick={onPrevious}
            aria-label="Previous day"
            icon={<LeftOutlined />}
          />
          <Button variant="secondary" onClick={onToday} disabled={isToday}>
            Today
          </Button>
          <Button
            variant="secondary"
            onClick={onNext}
            aria-label="Next day"
            icon={<RightOutlined />}
          />
        </Space.Compact>

        <DatePicker
          value={dayjs(selectedDate)}
          onChange={handleDateChange}
          allowClear={false}
          size="large"
          className="!w-[168px]"
          format="YYYY-MM-DD"
        />
      </Space>
    </Flex>
  )
}
