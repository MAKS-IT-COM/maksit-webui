/** Grid column span for 12-column form layouts (static classes for Tailwind). */
export type GridColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

const COL_SPAN_CLASS: Record<GridColSpan, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
}

/** Resolves `colspan` to a Tailwind class (dynamic ``col-span-${n}`` is not detected by Tailwind). */
export function colSpanClass (colspan?: GridColSpan, fallback = 'w-full'): string {
  return colspan ? COL_SPAN_CLASS[colspan] : fallback
}
