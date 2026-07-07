import { useCallback, useMemo, useState } from 'react'
import { applyFormBulkChange, applyFormFieldChange, validateFormState } from '../functions/zod'
import type { FormPath } from '../functions/zod/formPath'
import type { FormValidationSchema } from '../types/FormValidationSchema'

export interface UseFormStateProps<FormState extends Record<string, unknown>> {
  initialState: FormState
  validationSchema: FormValidationSchema<FormState>
}

const useFormState = <T extends Record<string, unknown>>(props: UseFormStateProps<T>) => {
  const { initialState, validationSchema } = props

  const [formState, setFormState] = useState(initialState)

  const memoizedValidationSchema = useMemo(() => validationSchema, [validationSchema])

  const { errors, formIsValid } = useMemo(
    () => validateFormState(formState, memoizedValidationSchema),
    [formState, memoizedValidationSchema],
  )

  const handleInputChange = useCallback((key: FormPath<T, 10>, value: unknown) => {
    setFormState((prev) => applyFormFieldChange(prev, key, value))
  }, [])

  const setInitialState = useCallback((newInitialState: T) => {
    setFormState(newInitialState)
  }, [])

  const setBulkState = useCallback((updater: (prev: T) => Partial<T>) => {
    setFormState((prev) => applyFormBulkChange(prev, updater))
  }, [])

  return {
    formState,
    errors,
    formIsValid,
    handleInputChange,
    setInitialState,
    setBulkState,
  }
}

export { useFormState }
