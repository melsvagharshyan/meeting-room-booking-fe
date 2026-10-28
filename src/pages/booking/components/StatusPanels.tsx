import { Alert, Card, Empty, Flex, Result, Spin } from 'antd'
import { Button } from '@/components/Button'

export function LoadingPanel({ label = 'Loading bookings...' }: { label?: string }) {
  return (
    <Card className="shadow-sm">
      <Flex align="center" justify="center" className="min-h-48">
        <Spin size="large" description={label}>
          <div className="h-16 w-40" />
        </Spin>
      </Flex>
    </Card>
  )
}

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card className="shadow-sm">
      <Result
        status="error"
        title="Couldn't load bookings"
        subTitle={message}
        extra={
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    </Card>
  )
}

export function PastDateBanner() {
  return (
    <Alert
      type="warning"
      showIcon
      message="This date is in the past. You can view bookings, but can't create or edit."
    />
  )
}

export function SelectSlotPanel() {
  return (
    <Card
      className="h-full shadow-sm"
      styles={{ body: { padding: '28px 24px' } }}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Flex vertical gap={4} align="center">
            <span className="font-medium text-slate-900">Nothing selected</span>
            <span className="text-slate-500">
              Click a booking to edit it, or create a new one.
            </span>
          </Flex>
        }
      />
    </Card>
  )
}
