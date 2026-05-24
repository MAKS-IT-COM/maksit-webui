import { extractFilenameFromHeaders } from './extractFilenameFromHeaders'

describe('extractFilenameFromHeaders', () => {
  it('returns fallback when header is missing', () => {
    expect(extractFilenameFromHeaders({}, 'default.bin')).toBe('default.bin')
  })

  it('parses RFC 5987 encoded filenames', () => {
    expect(
      extractFilenameFromHeaders({
        'content-disposition': "attachment; filename*=UTF-8''report%20file.pdf",
      })
    ).toBe('report file.pdf')
  })

  it('parses quoted filenames', () => {
    expect(
      extractFilenameFromHeaders({
        'content-disposition': 'attachment; filename="archive.zip"',
      })
    ).toBe('archive.zip')
  })

  it('parses plain filenames', () => {
    expect(
      extractFilenameFromHeaders({
        'content-disposition': 'attachment; filename=download.bin',
      })
    ).toBe('download.bin')
  })
})
