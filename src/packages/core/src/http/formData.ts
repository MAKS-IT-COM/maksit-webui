export function toFormData(
  form: FormData | Record<string, string | Blob | File | (string | Blob | File)[]>
): FormData {
  if (form instanceof FormData) {
    return form
  }

  const fd = new FormData()
  Object.entries(form).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(key, v))
    } else {
      fd.append(key, value)
    }
  })
  return fd
}
