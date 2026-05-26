import React, { useState } from 'react'
import type { GridColSpan } from '../../functions/tailwind'
import { FieldContainer } from './FieldContainer'

interface ListboxComponentProps {
  label?: string;
  itemsLabel?: string;
  colspan?: GridColSpan;
  items: string[];
  onChange: (items: string[]) => void;
  errorText?: string;
}

const ListboxComponent: React.FC<ListboxComponentProps> = (props) => {
  
  const {
    label,
    itemsLabel = 'Items',
    colspan = 6,
    items,
    onChange,
    errorText
  } = props

  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const toggleItemSelection = (item: string) => {
    if (selectedItems.includes(item)) {
      const updatedSelection = selectedItems.filter(i => i !== item)
      setSelectedItems(updatedSelection)
      onChange(updatedSelection)
    } else {
      const updatedSelection = [...selectedItems, item]
      setSelectedItems(updatedSelection)
      onChange(updatedSelection)
    }
  }

  return (
    <FieldContainer colspan={colspan} label={label} errorText={errorText}>
      <div className={'flex flex-col'}>
        <h3>{itemsLabel}</h3>
        <ul className={'border p-2 w-40 h-64 overflow-auto'}>
          {items.map(item => (
            <li
              key={item}
              className={`cursor-pointer hover:bg-gray-200 ${selectedItems.includes(item) ? 'bg-gray-300' : ''}`}
              onClick={() => toggleItemSelection(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </FieldContainer>
  )
}

export {
  ListboxComponent
}
