import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = Omit<AntButtonProps, 'type' | 'size' | 'variant'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children?: ReactNode
  htmlType?: AntButtonProps['htmlType']
  type?: 'button' | 'submit' | 'reset'
}

const sizeMap: Record<ButtonSize, AntButtonProps['size']> = {
  sm: 'middle',
  md: 'middle',
  lg: 'large',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  type = 'button',
  htmlType,
  danger,
  ...props
}: ButtonProps) {
  const antType: AntButtonProps['type'] =
    variant === 'primary' ? 'primary' : variant === 'ghost' ? 'text' : 'default'

  return (
    <AntButton
      type={antType}
      danger={variant === 'danger' || danger}
      size={sizeMap[size]}
      loading={loading}
      htmlType={htmlType ?? type}
      {...props}
    >
      {children}
    </AntButton>
  )
}
