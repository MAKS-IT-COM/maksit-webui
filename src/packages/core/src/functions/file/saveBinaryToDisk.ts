/**
 * Triggers a browser download for binary content using a temporary object URL.
 *
 * Creates an `<a download>` element, programmatically clicks it, removes it from the DOM,
 * and revokes the blob URL after a short delay.
 *
 * @param data - Raw bytes or an existing `Blob`.
 * @param filename - Suggested filename shown in the save dialog.
 */
const saveBinaryToDisk = (data: ArrayBuffer | Blob, filename: string) => {
  const blob = data instanceof Blob ? data : new Blob([data])
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename

  document.body.appendChild(a)
  a.click()
  a.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export {
  saveBinaryToDisk
}