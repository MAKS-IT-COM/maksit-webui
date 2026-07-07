import { useCallback, useMemo, useState } from 'react'
import {
  applyFormBulkChange,
  applyFormFieldChange,
  validateFormState,
  type FormPath
} from '../functions/zod'
import type { FormValidationSchema } from '../types/FormValidationSchema'

interface UseFormStateProps<FormState> {
  initialState: FormState
  validationSchema: FormValidationSchema<FormState>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useFormState = <T extends Record<string, any>,>(props: UseFormStateProps<T>) => {
  const {
    initialState,
    validationSchema
  } = props

  const [formState, setFormState] = useState(initialState)

  const memoizedValidationSchema = useMemo(() => validationSchema, [validationSchema])

  const { errors, formIsValid } = useMemo(
    () => validateFormState(formState, memoizedValidationSchema),
    [formState, memoizedValidationSchema]
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
    setBulkState
  }
}

export {
  useFormState
}
