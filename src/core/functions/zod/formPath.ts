type IsPlainObject<T> = T extends object
  ?
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  T extends Function
    ? false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : T extends Array<any>
      ? false
      : true
  : false

type Decrement<N extends number> = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9][N]

/**
 * Dot-notation path union for nested form fields (e.g. `"address.city"`).
 *
 * Recurses up to `Depth` levels into plain object properties. Arrays and functions
 * are excluded from traversal.
 */
type FormPath<T, Depth extends number = 5> = Depth extends 0
  ? never
  : T extends object
    ? IsPlainObject<T> extends true
      ? {
          [K in keyof T & string]: `${K}` | `${K}.${FormPath<T[K], Decrement<Depth>>}`
        }[keyof T & string]
      : never
    : never

export type { FormPath }
