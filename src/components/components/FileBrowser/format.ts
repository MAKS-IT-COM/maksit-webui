const formatBytes = (value?: number | null): string => {
  if (value == null || Number.isNaN(value))
    return '—'

  if (value < 1024)
    return `${value} B`

  const units = ['KB', 'MB', 'GB', 'TB']
  let size = value / 1024
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }

  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

const formatDate = (value?: string | null): string => {
  if (!value)
    return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return value

  return date.toLocaleString()
}

const formatMediaType = (mediaType?: string): string => {
  if (!mediaType)
    return '—'

  const map: Record<string, string> = {
    'application/json': 'JSON',
    'application/xml': 'XML',
    'text/plain': 'Text',
    'text/html': 'HTML',
    'text/csv': 'CSV',
    'application/pdf': 'PDF',
    'application/x-directory': 'Directory',
  }

  if (map[mediaType])
    return map[mediaType]

  if (mediaType.startsWith('text/'))
    return 'Text'

  if (mediaType.startsWith('image/'))
    return 'Image'

  const last = mediaType.split('/').pop() ?? mediaType
  return last.length > 24 ? `${last.slice(0, 22)}…` : last
}

const itemKindLabel = (item: {
  isFolder: boolean
  isVirtual?: boolean
  contentType?: string
  name: string
}): string => {
  if (item.isFolder)
    return item.isVirtual ? 'Virtual' : 'Folder'

  return formatMediaType(item.contentType)
}

/** Max object size for in-UI text/JSON preview (2 MiB). */
const PREVIEW_MAX_BYTES = 2 * 1024 * 1024

const isBinaryContentType = (contentType?: string): boolean => {
  const ct = (contentType ?? '').toLowerCase()
  if (!ct)
    return false

  return ct.includes('octet-stream')
    || ct.includes('tar')
    || ct.includes('gzip')
    || ct.includes('zip')
    || ct.includes('pdf')
    || ct.startsWith('image/')
    || ct.startsWith('audio/')
    || ct.startsWith('video/')
}

const canPreviewTextObject = (item: {
  isFolder: boolean
  isVirtual?: boolean
  name: string
  contentType?: string
  size?: number
}): boolean => {
  if (item.isFolder || item.isVirtual)
    return false

  if (item.size != null && item.size > PREVIEW_MAX_BYTES)
    return false

  const ct = (item.contentType ?? '').toLowerCase()
  if (isBinaryContentType(ct))
    return false

  if (ct.includes('json') || ct.startsWith('text/') || ct.includes('xml') || ct.includes('yaml'))
    return true

  const name = item.name.toLowerCase()
  if (/\.(json|txt|md|ya?ml|xml|csv|log|html?|css|js|ts|tsx|jsx)$/.test(name))
    return true

  if (item.size != null && item.size <= 512 * 1024 && !ct)
    return true

  return false
}

const formatPreviewText = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed)
    return raw

  if ((trimmed.startsWith('{') && trimmed.endsWith('}'))
    || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2)
    }
    catch {
      // Keep original text when not valid JSON.
    }
  }

  return raw
}

const buildNavCrumbs = (pathSegments: string[]): { label: string; segments: string[] }[] =>
  pathSegments.map((segment, i) => ({
    label: segment,
    segments: pathSegments.slice(0, i + 1),
  }))

export {
  buildNavCrumbs,
  canPreviewTextObject,
  formatBytes,
  formatDate,
  formatMediaType,
  formatPreviewText,
  itemKindLabel,
  PREVIEW_MAX_BYTES,
}
