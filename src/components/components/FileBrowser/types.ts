export interface FileBrowserItem {
  key: string
  /** Prefer over name when set (display label). */
  label?: string
  name: string
  isFolder: boolean
  /** Virtual list entry (not a real storage prefix). */
  isVirtual?: boolean
  size?: number
  lastModified?: string
  contentType?: string
  eTag?: string
}

export interface FileBrowserRoot {
  id: string
  label: string
  /** Tailwind text color class for the root folder icon (optional). */
  iconClassName?: string
}

export interface FileBrowserProps {
  roots: FileBrowserRoot[]
  activeRootId: string
  pathSegments: string[]
  items: FileBrowserItem[]
  loading?: boolean
  description?: string
  emptyHint?: string
  rootsTitle?: string
  canLoadMore?: boolean
  onNavigateRoot: (rootId: string) => void
  onNavigatePath: (rootId: string, segments: string[]) => void
  onRefresh: () => void
  onLoadMore?: () => void
  onDelete: (keys: string[]) => void | Promise<void>
  /** Create a folder under the current root + pathSegments. Host builds the storage key/prefix. */
  onCreateFolder?: (folderName: string) => void | Promise<void>
  /** Upload into the current folder. Host maps File[] → object keys/content-types. */
  onUpload?: (files: File[]) => void | Promise<void>
  /** Download a single selected file (not folders / virtual entries). */
  onDownload?: (item: FileBrowserItem) => void | Promise<void>
  /**
   * Load object bytes as text for the detail preview panel.
   * Return the raw text; the browser formats JSON when possible.
   */
  onFetchTextPreview?: (item: FileBrowserItem) => Promise<string>
}
