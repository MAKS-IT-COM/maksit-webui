import type { SearchEntityScopeEntry } from '@maks-it.com/webui-contracts'

export interface EntityScopesSummaryProps<TScopeEntityType extends number = number> {
  entries: SearchEntityScopeEntry<TScopeEntityType>[]
  title?: string
  /** Maps scope entity type enum value to a display label (e.g. app `ScopeEntityType`). */
  formatScopeEntityType?: (scopeEntityType: TScopeEntityType) => string
}

const permChars = <T extends number>(e: SearchEntityScopeEntry<T>): string => {
  const parts: string[] = []
  if (e.read) parts.push('R')
  if (e.write) parts.push('W')
  if (e.delete) parts.push('D')
  if (e.create) parts.push('C')
  return parts.length ? parts.join('') : '—'
}

export const EntityScopesSummary = <TScopeEntityType extends number = number>({
  entries,
  title = 'Scopes',
  formatScopeEntityType,
}: EntityScopesSummaryProps<TScopeEntityType>) => {
  if (!entries?.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">No scopes.</p>
      </div>
    )
  }

  const scopeLabel = (type: TScopeEntityType) =>
    formatScopeEntityType?.(type) ?? String(type)

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-800 px-4 py-2 border-b border-gray-200 bg-gray-50">
        {title}
      </h3>
      <ul className="divide-y divide-gray-100">
        {entries.map((entry, idx) => (
          <li key={`${entry.scopeEntityType}-${entry.entityId}-${idx}`} className="px-4 py-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">
              {scopeLabel(entry.scopeEntityType)}: {entry.entityName ?? entry.entityId}
            </span>
            <span className="text-gray-500 text-xs font-mono" title="Read, Write, Delete, Create">
              {permChars(entry)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
