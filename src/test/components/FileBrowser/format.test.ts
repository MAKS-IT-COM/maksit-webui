import {
  buildNavCrumbs,
  canPreviewTextObject,
  formatBytes,
  formatDate,
  formatMediaType,
  formatPreviewText,
  itemKindLabel,
  PREVIEW_MAX_BYTES,
} from '@webui/components/components/FileBrowser/format'

describe('FileBrowser format', () => {
  describe('formatBytes', () => {
    it('returns em dash for nullish or NaN', () => {
      expect(formatBytes(undefined)).toBe('—')
      expect(formatBytes(null)).toBe('—')
      expect(formatBytes(Number.NaN)).toBe('—')
    })

    it('formats bytes and larger units', () => {
      expect(formatBytes(512)).toBe('512 B')
      expect(formatBytes(2048)).toBe('2 KB')
      expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
    })
  })

  describe('formatDate', () => {
    it('returns em dash for empty', () => {
      expect(formatDate(undefined)).toBe('—')
      expect(formatDate('')).toBe('—')
    })

    it('returns original string for invalid dates', () => {
      expect(formatDate('not-a-date')).toBe('not-a-date')
    })

    it('formats valid ISO dates', () => {
      const formatted = formatDate('2026-07-20T10:00:00Z')
      expect(formatted).not.toBe('—')
      expect(formatted).toContain('2026')
    })
  })

  describe('formatMediaType / itemKindLabel', () => {
    it('maps known media types and folders', () => {
      expect(formatMediaType('application/json')).toBe('JSON')
      expect(formatMediaType('image/png')).toBe('Image')
      expect(formatMediaType(undefined)).toBe('—')
      expect(itemKindLabel({ isFolder: true, name: 'a' })).toBe('Folder')
      expect(itemKindLabel({ isFolder: true, isVirtual: true, name: 'a' })).toBe('Virtual')
      expect(itemKindLabel({ isFolder: false, name: 'a', contentType: 'text/plain' })).toBe('Text')
    })
  })

  describe('canPreviewTextObject', () => {
    it('rejects folders, virtual items, binaries, and oversized objects', () => {
      expect(canPreviewTextObject({ isFolder: true, name: 'dir' })).toBe(false)
      expect(canPreviewTextObject({ isFolder: false, isVirtual: true, name: 'v' })).toBe(false)
      expect(canPreviewTextObject({
        isFolder: false,
        name: 'blob.bin',
        contentType: 'application/octet-stream',
      })).toBe(false)
      expect(canPreviewTextObject({
        isFolder: false,
        name: 'big.json',
        contentType: 'application/json',
        size: PREVIEW_MAX_BYTES + 1,
      })).toBe(false)
    })

    it('allows json/text and known extensions', () => {
      expect(canPreviewTextObject({
        isFolder: false,
        name: 'data.json',
        contentType: 'application/json',
        size: 100,
      })).toBe(true)
      expect(canPreviewTextObject({
        isFolder: false,
        name: 'readme.md',
        size: 100,
      })).toBe(true)
    })
  })

  describe('formatPreviewText', () => {
    it('pretty-prints JSON and leaves plain text', () => {
      expect(formatPreviewText('{"a":1}')).toBe('{\n  "a": 1\n}')
      expect(formatPreviewText('hello')).toBe('hello')
      expect(formatPreviewText('{broken')).toBe('{broken')
    })
  })

  describe('buildNavCrumbs', () => {
    it('builds cumulative path segments', () => {
      expect(buildNavCrumbs(['a', 'b'])).toEqual([
        { label: 'a', segments: ['a'] },
        { label: 'b', segments: ['a', 'b'] },
      ])
    })
  })
})
