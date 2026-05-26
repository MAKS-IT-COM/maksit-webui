import { type ChangeEvent, useState, type ComponentType } from 'react'

/** DateTimePicker: `onChange(isoString?: string)` */
export function withControlledIsoDate<P extends { value?: string; onChange?: (iso?: string) => void }> (
  Component: ComponentType<P>,
  initial = '',
) {
  return function Controlled (props: Omit<P, 'value' | 'onChange'> & { value?: string }) {
    const [value, setValue] = useState(props.value ?? initial)
    return <Component {...(props as P)} value={value} onChange={setValue} />
  }
}

/** RadioGroup: `onChange(value: string)` */
export function withControlledRadioValue<P extends { value?: string; onChange?: (value: string) => void }> (
  Component: ComponentType<P>,
  initial = '',
) {
  return function Controlled (props: Omit<P, 'value' | 'onChange'> & { value?: string }) {
    const [value, setValue] = useState(props.value ?? initial)
    return <Component {...(props as P)} value={value} onChange={setValue} />
  }
}

/** DualListbox: `onChange(selectedItems: string[])` */
export function withControlledStringList<P extends { selectedItems: string[]; onChange: (items: string[]) => void }> (
  Component: ComponentType<P>,
) {
  return function Controlled (props: Omit<P, 'selectedItems' | 'onChange'> & { selectedItems?: string[] }) {
    const [selectedItems, setSelectedItems] = useState(props.selectedItems ?? [])
    return (
      <Component
        {...(props as P)}
        selectedItems={selectedItems}
        onChange={setSelectedItems}
      />
    )
  }
}

/** FileUpload: `onChange(files: File[])` */
export function withControlledFiles<P extends { files?: File[]; onChange?: (files: File[]) => void }> (
  Component: ComponentType<P>,
) {
  return function Controlled (props: Omit<P, 'files' | 'onChange'> & { files?: File[] }) {
    const [files, setFiles] = useState<File[]>(props.files ?? [])
    return <Component {...(props as P)} files={files} onChange={setFiles} />
  }
}

/** RemoteSelectBox: `onChange` as ChangeEvent handler */
export function withControlledRemoteSelect<P extends { value?: string | number; onChange?: (e: ChangeEvent<HTMLInputElement>) => void }> (
  Component: ComponentType<P & { onChange: (e: ChangeEvent<HTMLInputElement>) => void }>,
  initial: string | number = '',
) {
  return function Controlled (
    props: Omit<P, 'value' | 'onChange'> & { value?: string | number; onChange?: (e: ChangeEvent<HTMLInputElement>) => void },
  ) {
    const [value, setValue] = useState(props.value ?? initial)
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
    }
    return <Component {...(props as P)} value={value} onChange={handleChange} />
  }
}
