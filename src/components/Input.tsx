import { Input as AntInput } from 'antd'
import type { InputProps as AntInputProps } from 'antd'
import { FormField } from './FormField'

type InputProps = AntInputProps & {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, name, ...props }: InputProps) {
  const inputId = id ?? name

  return (
    <FormField label={label} htmlFor={inputId} error={error} hint={hint}>
      <AntInput
        id={inputId}
        name={name}
        status={error ? 'error' : undefined}
        size="large"
        {...props}
      />
    </FormField>
  )
}
