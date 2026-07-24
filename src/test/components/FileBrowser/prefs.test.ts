import { loadPrefs, savePrefs } from '@webui/components/components/FileBrowser/prefs'

describe('FileBrowser prefs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when empty', () => {
    expect(loadPrefs()).toEqual({ sortColumn: 'name', sortDirection: 'asc' })
  })

  it('round-trips prefs through localStorage', () => {
    savePrefs({ sortColumn: 'size', sortDirection: 'desc' })
    expect(loadPrefs()).toEqual({ sortColumn: 'size', sortDirection: 'desc' })
  })

  it('falls back for partial or invalid JSON', () => {
    localStorage.setItem('maksit.webui.fileBrowser.prefs.v1', '{"sortColumn":"modified"}')
    expect(loadPrefs()).toEqual({ sortColumn: 'modified', sortDirection: 'asc' })

    localStorage.setItem('maksit.webui.fileBrowser.prefs.v1', '{not-json')
    expect(loadPrefs()).toEqual({ sortColumn: 'name', sortDirection: 'asc' })
  })
})
