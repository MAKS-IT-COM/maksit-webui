import React, { useCallback, useRef, useState } from 'react'
import { colSpanClass, type GridColSpan } from '../../functions'
import { ButtonComponent } from './ButtonComponent'
import { Trash2, Upload } from 'lucide-react'

interface FileUploadComponentProps {
  label?: string
  colspan?: GridColSpan
  multiple?: boolean
  /** Comma-separated accept list for the file input (e.g. `.pdf,image/*`). */
  accept?: string
  files?: File[]
  onChange?: (files: File[]) => void
  disabled?: boolean
  /** When true (default), the control accepts drag-and-drop. */
  droppable?: boolean
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  label = 'Select files',
  colspan = 6,
  multiple = true,
  accept,
  files,
  onChange,
  disabled = false,
  droppable = true,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [popupPos, setPopupPos] = useState<{x: number, y: number}>({x: 0, y: 0})
  const [dragActive, setDragActive] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepthRef = useRef(0)

  React.useEffect(() => {
    if (showPopup && popupRef.current)
      popupRef.current.focus()
  }, [showPopup])

  const areFilesEqual = (left: File[], right: File[]) =>
    left.length === right.length &&
    left.every((file, index) => {
      const other = right[index]
      return other &&
        file.name === other.name &&
        file.size === other.size &&
        file.lastModified === other.lastModified &&
        file.type === other.type
    })

  const displayFiles = files ?? selectedFiles

  React.useEffect(() => {
    if (files !== undefined && files.length === 0 && inputRef.current)
      inputRef.current.value = ''
  }, [files])

  const applyFiles = useCallback((nextFiles: File[]) => {
    if (files === undefined)
      setSelectedFiles(nextFiles)

    if (!areFilesEqual(nextFiles, displayFiles))
      onChange?.(nextFiles)
  }, [displayFiles, files, onChange])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = e.target.files ? Array.from(e.target.files) : []
    applyFiles(nextFiles)
  }

  const handleClear = () => {
    if (files === undefined)
      setSelectedFiles([])

    if (inputRef.current)
      inputRef.current.value = ''

    if (displayFiles.length > 0)
      onChange?.([])
  }

  const handleSelectFiles = () => {
    if (!disabled)
      inputRef.current?.click()
  }

  const resetDrag = () => {
    dragDepthRef.current = 0
    setDragActive(false)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    if (!droppable || disabled)
      return

    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current += 1
    if (e.dataTransfer.types.includes('Files'))
      setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!droppable || disabled)
      return

    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0)
      setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!droppable || disabled)
      return

    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!droppable || disabled)
      return

    e.preventDefault()
    e.stopPropagation()
    resetDrag()

    const dropped = Array.from(e.dataTransfer.files ?? [])
    if (dropped.length === 0)
      return

    applyFiles(multiple ? dropped : dropped.slice(0, 1))
  }

  return (
    <div
      className={[
        'grid grid-cols-4 gap-2 rounded border border-dashed p-2 transition-colors',
        colSpanClass(colspan),
        dragActive
          ? 'border-sky-500 bg-sky-50'
          : droppable && !disabled
            ? 'border-gray-300'
            : 'border-transparent',
      ].filter(Boolean).join(' ')}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type={'file'}
        multiple={multiple}
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div
        className={'col-span-1 flex items-center justify-center relative'}
        onMouseEnter={e => {
          setShowPopup(true)
          if (!showPopup)
            setPopupPos({ x: e.clientX, y: e.clientY })
        }}
        onMouseLeave={e => {
          if (!popupRef.current || !popupRef.current.contains(e.relatedTarget as Node))
            setShowPopup(false)
        }}
      >
        <span
          className={'bg-gray-200 px-4 py-2 rounded w-full text-center select-none block'}
          style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {displayFiles.length} file{displayFiles.length !== 1 ? 's' : ''}
        </span>
        {showPopup && displayFiles.length > 0 && (
          <div
            ref={popupRef}
            className={'fixed z-50 bg-white border border-gray-300 rounded shadow-lg p-2 text-sm'}
            tabIndex={0}
            style={{
              left: popupPos.x + 2,
              top: popupPos.y + 2,
              maxWidth: '400px',
              whiteSpace: 'nowrap',
              minWidth: '120px',
              pointerEvents: 'auto',
              outline: 'none',
            }}
            onBlur={e => {
              if (!e.relatedTarget || (!popupRef.current?.contains(e.relatedTarget as Node) && !(e.relatedTarget as HTMLElement)?.closest('.col-span-1')))
                setShowPopup(false)
            }}
            onMouseLeave={e => {
              const parent = (e.relatedTarget as HTMLElement)?.closest('.col-span-1')
              if (!parent)
                setShowPopup(false)
            }}
            onKeyDown={e => {
              if (e.key === 'Escape')
                setShowPopup(false)
            }}
          >
            <ul className={'max-h-40 overflow-auto'} tabIndex={0} style={{outline: 'none'}}>
              {displayFiles.map((file, idx) => (
                <li key={file.name + idx} className={'truncate'} title={file.name}>
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ButtonComponent
        buttonHierarchy={'secondary'}
        onClick={handleClear}
        disabled={disabled || displayFiles.length === 0}
        colspan={1}
      >
        <Trash2 />
      </ButtonComponent>

      <ButtonComponent
        colspan={2}
        buttonHierarchy={'primary'}
        onClick={handleSelectFiles}
        disabled={disabled}
      >
        <span className={'inline-flex items-center gap-2'}>
          <Upload className={'h-4 w-4'} />
          {dragActive ? 'Drop files' : label}
        </span>
      </ButtonComponent>
    </div>
  )
}

export { FileUploadComponent }
export type { FileUploadComponentProps }
