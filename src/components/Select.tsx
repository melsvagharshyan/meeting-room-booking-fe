import { Select as AntSelect } from 'antd'
import type { SelectProps as AntSelectProps } from 'antd'
import { FormField } from './FormField'

type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SelectProps = Omit<AntSelectProps, 'options' | 'onChange'> & {
  label: string
  error?: string
  options: SelectOption[]
  name?: string
  onChange?: (value: string) => void
  onBlur?: () => void
}

export function Select({
  label,
  error,
  options,
  id,
  name,
  value,
  onChange,
  onBlur,
  ...props
}: SelectProps) {
  const selectId = id ?? name

  return (
    <FormField label={label} htmlFor={selectId} error={error}>
      <AntSelect
        id={selectId}
        value={value}
        onChange={(next) => onChange?.(String(next))}
        onBlur={onBlur}
        options={options}
        status={error ? 'error' : undefined}
        size="large"
        className="w-full"
        {...props}
      />
    </FormField>
  )
}
