import { ChangeEvent, useState, type ComponentType } from 'react'

type ControlledValue = string | number | boolean

type ChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void

export function withControlledValue<Props> (
  Component: ComponentType<Props>,
  initialValue: ControlledValue = '',
): ComponentType<Omit<Props, 'value' | 'onChange'> & { value?: ControlledValue }> {
  function ControlledStory (
    props: Omit<Props, 'value' | 'onChange'> & { value?: ControlledValue },
  ) {
    const [value, setValue] = useState<ControlledValue>(props.value ?? initialValue)

    const handleChange: ChangeHandler = (e) => {
      const next =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value
      setValue(next)
    }

    return (
      <Component
        {...(props as Props)}
        value={value as Props extends { value?: infer V } ? V : never}
        onChange={handleChange as Props extends { onChange?: infer H } ? H : never}
      />
    )
  }

  return ControlledStory as ComponentType<
    Omit<Props, 'value' | 'onChange'> & { value?: ControlledValue }
  >
}
