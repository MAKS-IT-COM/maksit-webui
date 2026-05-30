let toastIdSeq = 0

/** Works on plain HTTP; crypto.randomUUID() requires a secure context. */
export const createToastId = (): string => {
  toastIdSeq += 1
  return `toast-${toastIdSeq}-${Date.now()}`
}
