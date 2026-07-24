import { FC, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Copy,
  Download,
  Eye,
  File,
  FileCode,
  FileImage,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Package,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { ButtonComponent } from '../editors/ButtonComponent'
import { Modal } from '../Modal'
import {
  buildNavCrumbs,
  canPreviewTextObject,
  formatBytes,
  formatDate,
  formatMediaType,
  formatPreviewText,
  itemKindLabel,
  PREVIEW_MAX_BYTES,
} from './format'
import { loadPrefs, savePrefs, type SortColumn, type SortDirection } from './prefs'
import type { FileBrowserItem, FileBrowserProps } from './types'

const typeSortValue = (item: FileBrowserItem): string => {
  if (item.isFolder)
    return item.isVirtual ? 'Virtual' : 'Folder'

  return formatMediaType(item.contentType)
}

const compareItems = (
  a: FileBrowserItem,
  b: FileBrowserItem,
  column: SortColumn,
  direction: SortDirection,
): number => {
  const dir = direction === 'asc' ? 1 : -1

  if (a.isFolder !== b.isFolder)
    return a.isFolder ? -1 : 1

  let cmp = 0
  switch (column) {
    case 'name':
      cmp = (a.label ?? a.name).localeCompare(b.label ?? b.name, undefined, { sensitivity: 'base' })
      break
    case 'kind':
      cmp = itemKindLabel(a).localeCompare(itemKindLabel(b), undefined, { sensitivity: 'base' })
      break
    case 'size': {
      const sa = a.isFolder ? -1 : (a.size ?? 0)
      const sb = b.isFolder ? -1 : (b.size ?? 0)
      cmp = sa === sb ? 0 : sa < sb ? -1 : 1
      break
    }
    case 'modified': {
      const ta = a.lastModified ? Date.parse(a.lastModified) : 0
      const tb = b.lastModified ? Date.parse(b.lastModified) : 0
      cmp = ta === tb ? 0 : ta < tb ? -1 : 1
      break
    }
    case 'type':
      cmp = typeSortValue(a).localeCompare(typeSortValue(b), undefined, { sensitivity: 'base' })
      break
  }

  if (cmp !== 0)
    return cmp * dir

  return (a.label ?? a.name).localeCompare(b.label ?? b.name, undefined, { sensitivity: 'base' }) * dir
}

const fileIcon = (item: FileBrowserItem) => {
  if (item.isFolder) {
    if (item.isVirtual)
      return Package
    return Folder
  }

  const name = item.name.toLowerCase()
  if (name.endsWith('.json') || (item.contentType ?? '').includes('json'))
    return FileJson
  if (/\.(png|jpe?g|gif|webp|svg|bmp)$/.test(name) || (item.contentType ?? '').startsWith('image/'))
    return FileImage
  if (/\.(txt|md|ya?ml|xml|csv|log|html?|css)$/.test(name) || (item.contentType ?? '').startsWith('text/'))
    return FileText
  if (/\.(js|ts|tsx|jsx|cs|py|go|rs)$/.test(name))
    return FileCode

  return File
}

const FileBrowser: FC<FileBrowserProps> = (props) => {
  const {
    roots,
    activeRootId,
    pathSegments,
    items,
    loading = false,
    description,
    emptyHint,
    rootsTitle = 'Roots',
    canLoadMore = false,
    onNavigateRoot,
    onNavigatePath,
    onRefresh,
    onLoadMore,
    onDelete,
    onCreateFolder,
    onUpload,
    onDownload,
    onFetchTextPreview,
  } = props

  const filterInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const previewRequestId = useRef(0)
  const initialPrefs = useMemo(() => loadPrefs(), [])

  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>(initialPrefs.sortColumn)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialPrefs.sortDirection)
  const [previewText, setPreviewText] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [actionBusy, setActionBusy] = useState(false)

  const pathKey = pathSegments.join('/')
  const navCrumbs = useMemo(() => buildNavCrumbs(pathSegments), [pathSegments])

  useEffect(() => {
    setSelectedKeys([])
    setCopiedField(null)
    setPreviewText(null)
    setPreviewError(null)
    setPreviewLoading(false)
    setNameFilter('')
  }, [activeRootId, pathKey])

  useEffect(() => {
    savePrefs({ sortColumn, sortDirection })
  }, [sortColumn, sortDirection])

  const toggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortColumn(column)
    setSortDirection('asc')
  }

  const visibleItems = useMemo(() => {
    let list = [...items]
    const q = nameFilter.trim().toLowerCase()
    if (q) {
      list = list.filter(i => {
        const hay = `${i.label ?? ''} ${i.name} ${i.key}`.toLowerCase()
        return hay.includes(q)
      })
    }

    list.sort((a, b) => compareItems(a, b, sortColumn, sortDirection))
    return list
  }, [items, nameFilter, sortColumn, sortDirection])

  const selectedItem = useMemo(() => {
    if (selectedKeys.length !== 1)
      return undefined
    return items.find(i => i.key === selectedKeys[0])
  }, [items, selectedKeys])

  useEffect(() => {
    if (!selectedItem || !onFetchTextPreview || !canPreviewTextObject(selectedItem)) {
      setPreviewText(null)
      setPreviewError(null)
      setPreviewLoading(false)
      return
    }

    const requestId = ++previewRequestId.current
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewText(null)

    void onFetchTextPreview(selectedItem)
      .then((raw) => {
        if (previewRequestId.current !== requestId)
          return
        setPreviewText(formatPreviewText(raw))
        setPreviewError(null)
      })
      .catch((err: unknown) => {
        if (previewRequestId.current !== requestId)
          return
        const message = err instanceof Error ? err.message : 'Failed to load preview.'
        setPreviewError(message)
        setPreviewText(null)
      })
      .finally(() => {
        if (previewRequestId.current === requestId)
          setPreviewLoading(false)
      })
  }, [selectedItem, onFetchTextPreview])

  const selectedItems = useMemo(
    () => items.filter(i => selectedKeys.includes(i.key)),
    [items, selectedKeys],
  )

  const selectionBytes = useMemo(
    () => selectedItems.reduce((sum, i) => sum + (i.isFolder ? 0 : (i.size ?? 0)), 0),
    [selectedItems],
  )

  const selectionBlocked = useMemo(
    () => selectedItems.some(i => i.isFolder && i.isVirtual),
    [selectedItems],
  )

  const deleteBlockedReason = useMemo(() => {
    if (!selectedItems.length)
      return undefined
    if (selectedItems.some(i => i.isFolder && i.isVirtual))
      return 'Virtual folders cannot be deleted here'
    return undefined
  }, [selectedItems])

  const openFolder = (item: FileBrowserItem) => {
    if (!item.isFolder)
      return

    if (!activeRootId) {
      onNavigateRoot(item.name)
      return
    }

    onNavigatePath(activeRootId, [...pathSegments, item.name])
  }

  const activateItem = (item: FileBrowserItem) => {
    if (item.isFolder) {
      openFolder(item)
      return
    }

    setSelectedKeys([item.key])
  }

  const toggleSelect = (key: string, multi: boolean) => {
    setSelectedKeys(prev => {
      if (!multi)
        return prev.length === 1 && prev[0] === key ? [] : [key]

      if (prev.includes(key))
        return prev.filter(k => k !== key)

      return [...prev, key]
    })
  }

  const canDownload = Boolean(
    onDownload
    && selectedItem
    && !selectedItem.isFolder
    && !selectedItem.isVirtual,
  )

  const handleDelete = async () => {
    if (!selectedKeys.length || selectionBlocked || actionBusy)
      return

    setActionBusy(true)
    try {
      await onDelete(selectedKeys)
      setSelectedKeys([])
    }
    finally {
      setActionBusy(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!onCreateFolder || actionBusy)
      return

    const name = folderName.trim()
    if (!name)
      return

    setActionBusy(true)
    try {
      await onCreateFolder(name)
      setCreateFolderOpen(false)
      setFolderName('')
      setSelectedKeys([])
    }
    finally {
      setActionBusy(false)
    }
  }

  const handleUploadChange = async (files: FileList | null) => {
    if (!onUpload || !files?.length || actionBusy)
      return

    setActionBusy(true)
    try {
      await onUpload(Array.from(files))
      setSelectedKeys([])
    }
    finally {
      setActionBusy(false)
      if (uploadInputRef.current)
        uploadInputRef.current.value = ''
    }
  }

  const handleDownload = async () => {
    if (!canDownload || !selectedItem || !onDownload || actionBusy)
      return

    setActionBusy(true)
    try {
      await onDownload(selectedItem)
    }
    finally {
      setActionBusy(false)
    }
  }

  const copyValue = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(prev => prev === field ? null : prev), 1500)
    }
    catch {
      setCopiedField(null)
    }
  }

  const onFilterKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setNameFilter('')
      filterInputRef.current?.blur()
    }
  }

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column)
      return <ArrowUpDown className={'h-3.5 w-3.5 opacity-40'} />
    return sortDirection === 'asc'
      ? <ArrowUp className={'h-3.5 w-3.5'} />
      : <ArrowDown className={'h-3.5 w-3.5'} />
  }

  const activeRoot = roots.find(r => r.id === activeRootId)

  return (
    <div className={'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden'}>
      {description && (
        <p className={'shrink-0 text-sm text-gray-600'}>{description}</p>
      )}

      <div className={'flex min-h-0 flex-1 overflow-hidden rounded border border-gray-200 bg-white'}>
        <aside className={'flex w-52 shrink-0 flex-col border-r border-gray-200 bg-gray-50'}>
          <div className={'border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500'}>
            {rootsTitle}
          </div>
          <div className={'min-h-0 flex-1 overflow-y-auto p-1'}>
            {roots.map((root) => {
              const isActiveRoot = root.id === activeRootId
              const active = isActiveRoot && pathSegments.length === 0
              return (
                <button
                  key={root.id}
                  type={'button'}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                    active ? 'bg-sky-100 text-sky-900' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => onNavigateRoot(root.id)}
                >
                  <HardDrive className={`h-4 w-4 shrink-0 ${root.iconClassName ?? 'text-sky-600'}`} />
                  <span className={'truncate'}>{root.label}</span>
                </button>
              )
            })}
            {activeRootId && navCrumbs.map((crumb) => {
              const isLast = crumb.segments.length === pathSegments.length
              return (
                <button
                  key={crumb.segments.join('/')}
                  type={'button'}
                  className={`mt-0.5 flex w-full items-center gap-1 rounded px-2 py-1.5 pl-4 text-left text-sm ${
                    isLast ? 'bg-sky-100 text-sky-900' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => onNavigatePath(activeRootId, crumb.segments)}
                >
                  <ChevronRight className={'h-3.5 w-3.5 shrink-0 text-gray-400'} />
                  <FolderOpen className={'h-4 w-4 shrink-0 text-amber-500'} />
                  <span className={'truncate'}>{crumb.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className={'flex min-w-0 flex-1 flex-col'}>
          <div className={'flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5'}>
            {onCreateFolder && activeRootId ? (
              <button
                type={'button'}
                title={'New folder'}
                disabled={actionBusy}
                className={'inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-40'}
                onClick={() => {
                  setFolderName('')
                  setCreateFolderOpen(true)
                }}
              >
                <FolderPlus className={'h-4 w-4'} />
                New folder
              </button>
            ) : null}
            {onUpload && activeRootId ? (
              <>
                <input
                  ref={uploadInputRef}
                  type={'file'}
                  multiple={true}
                  className={'hidden'}
                  onChange={(e) => void handleUploadChange(e.target.files)}
                />
                <button
                  type={'button'}
                  title={'Upload'}
                  disabled={actionBusy}
                  className={'inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-40'}
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <Upload className={'h-4 w-4'} />
                  Upload
                </button>
              </>
            ) : null}
            <button
              type={'button'}
              title={deleteBlockedReason ?? 'Delete'}
              disabled={selectedKeys.length === 0 || selectionBlocked || actionBusy}
              className={'inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-40'}
              onClick={() => void handleDelete()}
            >
              <Trash2 className={'h-4 w-4'} />
              Delete
            </button>
            {canDownload ? (
              <button
                type={'button'}
                title={'Download'}
                disabled={actionBusy}
                className={'inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm text-sky-800 hover:bg-sky-50 disabled:opacity-40'}
                onClick={() => void handleDownload()}
              >
                <Download className={'h-4 w-4'} />
                Download
              </button>
            ) : null}
            <button
              type={'button'}
              title={'Refresh'}
              disabled={actionBusy}
              className={'inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-40'}
              onClick={() => {
                setSelectedKeys([])
                onRefresh()
              }}
            >
              <RefreshCw className={'h-4 w-4'} />
              Refresh
            </button>

            <div className={'ml-auto flex items-center gap-1'}>
              <Search className={'h-4 w-4 text-gray-400'} />
              <input
                ref={filterInputRef}
                type={'search'}
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                onKeyDown={onFilterKeyDown}
                placeholder={'Filter…'}
                className={'h-8 w-40 rounded border border-gray-300 px-2 text-sm focus:border-sky-500 focus:outline-none'}
              />
            </div>
          </div>

          <div className={'flex flex-wrap items-center gap-1 border-b border-gray-100 px-2 py-1 text-xs text-gray-500'}>
            <button
              type={'button'}
              className={'rounded px-1.5 py-0.5 hover:bg-gray-100 hover:text-gray-800'}
              onClick={() => onNavigateRoot(activeRootId)}
              disabled={!activeRootId}
            >
              {activeRoot?.label ?? rootsTitle}
            </button>
            {navCrumbs.map((crumb) => (
              <span key={crumb.segments.join('/')} className={'inline-flex items-center gap-1'}>
                <ChevronRight className={'h-3 w-3'} />
                <button
                  type={'button'}
                  className={'rounded px-1.5 py-0.5 hover:bg-gray-100 hover:text-gray-800'}
                  onClick={() => onNavigatePath(activeRootId, crumb.segments)}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
            {loading && <span className={'ml-2 text-sky-700'}>Loading…</span>}
            {selectedKeys.length > 0 && (
              <span className={'ml-auto'}>
                {selectedKeys.length} selected
                {selectionBytes > 0 ? ` · ${formatBytes(selectionBytes)}` : ''}
              </span>
            )}
          </div>

          <div className={'min-h-0 flex-1 overflow-auto'}>
            {visibleItems.length === 0 && !loading ? (
              <div className={'px-4 py-8 text-center text-sm text-gray-500'}>
                {emptyHint ?? 'No items in this folder.'}
              </div>
            ) : (
              <table className={'w-full border-collapse text-sm'}>
                <thead className={'sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'}>
                  <tr className={'text-left text-xs uppercase tracking-wide text-gray-500'}>
                    {([
                      ['name', 'Name'],
                      ['kind', 'Kind'],
                      ['size', 'Size'],
                      ['modified', 'Modified'],
                      ['type', 'Type'],
                    ] as const).map(([column, label]) => (
                      <th key={column} className={'px-2 py-2 font-semibold'}>
                        <button
                          type={'button'}
                          className={'inline-flex items-center gap-1 hover:text-gray-800'}
                          onClick={() => toggleSort(column)}
                        >
                          {label}
                          <SortIcon column={column} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(pathSegments.length > 0 || Boolean(activeRootId)) && (
                    <tr
                      className={'cursor-pointer border-t border-gray-100 hover:bg-gray-50'}
                      onDoubleClick={() => {
                        if (pathSegments.length > 0)
                          onNavigatePath(activeRootId, pathSegments.slice(0, -1))
                        else
                          onNavigateRoot('')
                      }}
                    >
                      <td className={'px-2 py-1.5'} colSpan={5}>
                        <span className={'inline-flex items-center gap-2 text-gray-600'}>
                          <Folder className={'h-4 w-4 text-amber-500'} />
                          ..
                        </span>
                      </td>
                    </tr>
                  )}
                  {visibleItems.map((item) => {
                    const selected = selectedKeys.includes(item.key)
                    const Icon = fileIcon(item)
                    const displayName = item.label && item.label !== item.name ? item.label : item.name

                    return (
                      <tr
                        key={item.key}
                        className={`cursor-pointer border-t border-gray-100 ${
                          selected ? 'bg-sky-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={(e) => toggleSelect(item.key, e.ctrlKey || e.metaKey || e.shiftKey)}
                        onDoubleClick={() => activateItem(item)}
                      >
                        <td className={'px-2 py-1.5'}>
                          <span className={'inline-flex min-w-0 items-center gap-2'}>
                            <Icon className={`h-4 w-4 shrink-0 ${
                              item.isFolder
                                ? item.isVirtual ? 'text-violet-500' : 'text-amber-500'
                                : 'text-sky-600'
                            }`} />
                            <span className={'truncate font-medium text-gray-900'}>
                              {displayName}{item.isFolder ? '/' : ''}
                            </span>
                          </span>
                        </td>
                        <td className={'px-2 py-1.5 text-gray-600'}>{itemKindLabel(item)}</td>
                        <td className={'px-2 py-1.5 text-gray-600'}>
                          {item.isFolder ? '—' : formatBytes(item.size)}
                        </td>
                        <td className={'px-2 py-1.5 text-gray-600'}>{formatDate(item.lastModified)}</td>
                        <td className={'px-2 py-1.5 text-gray-600'} title={item.contentType}>
                          {item.isFolder ? '—' : formatMediaType(item.contentType)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {canLoadMore && onLoadMore && (
            <div className={'border-t border-gray-200 px-2 py-2'}>
              <ButtonComponent label={'Load more'} onClick={onLoadMore} />
            </div>
          )}
        </div>

        {selectedItem && (
          <aside className={'flex w-72 shrink-0 flex-col border-l border-gray-200 bg-gray-50'}>
            <div className={'border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500'}>
              Details
            </div>
            <div className={'min-h-0 flex-1 space-y-3 overflow-y-auto p-3 text-sm'}>
              <div>
                <div className={'text-xs font-medium text-gray-500'}>Name</div>
                <div className={'break-all font-medium text-gray-900'}>{selectedItem.label ?? selectedItem.name}</div>
              </div>
              <div>
                <div className={'mb-1 flex items-center justify-between text-xs font-medium text-gray-500'}>
                  <span>Key</span>
                  <button
                    type={'button'}
                    className={'inline-flex items-center gap-1 text-sky-700 hover:underline'}
                    onClick={() => void copyValue('key', selectedItem.key)}
                  >
                    <Copy className={'h-3.5 w-3.5'} />
                    {copiedField === 'key' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className={'break-all font-mono text-xs text-gray-700'}>{selectedItem.key}</div>
              </div>
              <dl className={'grid grid-cols-1 gap-2 text-xs'}>
                <div>
                  <dt className={'text-gray-500'}>Kind</dt>
                  <dd className={'text-gray-800'}>{itemKindLabel(selectedItem)}</dd>
                </div>
                {!selectedItem.isFolder && (
                  <>
                    <div>
                      <dt className={'text-gray-500'}>Size</dt>
                      <dd className={'text-gray-800'}>{formatBytes(selectedItem.size)}</dd>
                    </div>
                    <div>
                      <dt className={'text-gray-500'}>Type</dt>
                      <dd className={'text-gray-800'} title={selectedItem.contentType}>
                        {formatMediaType(selectedItem.contentType)}
                      </dd>
                      {selectedItem.contentType && formatMediaType(selectedItem.contentType) !== selectedItem.contentType && (
                        <dd className={'mt-1 break-all font-mono text-[11px] text-gray-400'}>{selectedItem.contentType}</dd>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <dt className={'text-gray-500'}>Modified</dt>
                  <dd className={'text-gray-800'}>{formatDate(selectedItem.lastModified)}</dd>
                </div>
                {selectedItem.eTag && (
                  <div>
                    <dt className={'text-gray-500'}>ETag</dt>
                    <dd className={'break-all font-mono text-gray-700'}>{selectedItem.eTag}</dd>
                  </div>
                )}
              </dl>

              {onFetchTextPreview && !selectedItem.isFolder && !selectedItem.isVirtual && canPreviewTextObject(selectedItem) && (
                <div>
                  <div className={'mb-1 inline-flex items-center gap-1 text-xs font-medium text-gray-500'}>
                    <Eye className={'h-3.5 w-3.5'} />
                    Preview
                    {selectedItem.size != null && selectedItem.size > PREVIEW_MAX_BYTES && (
                      <span className={'font-normal text-amber-700'}>(too large)</span>
                    )}
                  </div>
                  {previewLoading && <p className={'text-xs text-gray-500'}>Loading…</p>}
                  {previewError && <p className={'text-xs text-red-600'}>{previewError}</p>}
                  {previewText != null && (
                    <pre className={'max-h-64 overflow-auto rounded border border-gray-200 bg-white p-2 font-mono text-[11px] text-gray-800'}>
                      {previewText}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      <Modal
        isOpen={createFolderOpen}
        title={'New folder'}
        size={'sm'}
        onClose={() => {
          if (!actionBusy)
            setCreateFolderOpen(false)
        }}
        closeOnBackdrop={!actionBusy}
        closeOnEscape={!actionBusy}
        footer={(
          <>
            <ButtonComponent
              label={'Cancel'}
              buttonHierarchy={'secondary'}
              disabled={actionBusy}
              onClick={() => setCreateFolderOpen(false)}
            />
            <ButtonComponent
              label={'Create'}
              buttonHierarchy={'primary'}
              disabled={actionBusy || !folderName.trim()}
              onClick={() => void handleCreateFolder()}
            />
          </>
        )}
      >
        <label className={'block text-sm text-gray-700'}>
          Folder name
          <input
            type={'text'}
            value={folderName}
            autoFocus={true}
            disabled={actionBusy}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                void handleCreateFolder()
            }}
            className={'mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none'}
            placeholder={'e.g. reports'}
          />
        </label>
      </Modal>
    </div>
  )
}

export { FileBrowser }
