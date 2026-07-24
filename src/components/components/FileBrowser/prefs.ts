export type SortColumn = 'name' | 'kind' | 'size' | 'modified' | 'type'
export type SortDirection = 'asc' | 'desc'

export type FileBrowserPrefs = {
  sortColumn: SortColumn
  sortDirection: SortDirection
}

const STORAGE_KEY = 'maksit.webui.fileBrowser.prefs.v1'

const loadPrefs = (): FileBrowserPrefs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return { sortColumn: 'name', sortDirection: 'asc' }

    const parsed = JSON.parse(raw) as Partial<FileBrowserPrefs>
    return {
      sortColumn: parsed.sortColumn ?? 'name',
      sortDirection: parsed.sortDirection ?? 'asc',
    }
  }
  catch {
    return { sortColumn: 'name', sortDirection: 'asc' }
  }
}

const savePrefs = (prefs: FileBrowserPrefs): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }
  catch {
    // Ignore quota / private mode.
  }
}

export {
  loadPrefs,
  savePrefs,
}
