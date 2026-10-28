import type { ReactNode } from 'react'
import { Typography } from 'antd'

type FormFieldProps = {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <Typography.Text type="secondary" className="!text-xs">
          {hint}
        </Typography.Text>
      ) : null}
      {error ? (
        <Typography.Text type="danger" role="alert" className="!text-xs">
          {error}
        </Typography.Text>
      ) : null}
    </div>
  )
}
