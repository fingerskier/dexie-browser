import {
  DEFAULT_CREDENTIALS,
  mergeWithDefaultCredentials,
  type DexieCloudCredentials
} from './dexieCloudCredentials'

export interface KnownDatabase {
  id: string
  name: string
  credentials: DexieCloudCredentials
}

export const KNOWN_DATABASES_STORAGE_KEY = 'dexie-browser/known-databases'
export const SELECTED_KNOWN_DATABASE_ID_STORAGE_KEY = 'dexie-browser/known-databases/selected-id'
export const SELECTED_KNOWN_DATABASE_QUERY_KEY = 'dexie-db'

export function createKnownDatabase (
  name: string,
  credentials: Partial<DexieCloudCredentials> = DEFAULT_CREDENTIALS
): KnownDatabase {
  return {
    id: createId(),
    name,
    credentials: mergeWithDefaultCredentials(credentials)
  }
}

export function normalizeKnownDatabases (
  databases: KnownDatabase[]
): KnownDatabase[] {
  return databases.map(database => ({
    ...database,
    credentials: mergeWithDefaultCredentials(database.credentials)
  }))
}

export function loadKnownDatabasesFromStorage (): KnownDatabase[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(KNOWN_DATABASES_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return normalizeKnownDatabases(parsed as KnownDatabase[])
  } catch (err) {
    console.warn('Failed to parse stored known databases', err)
    return []
  }
}

export function loadStoredSelectedKnownDatabaseId (): string | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SELECTED_KNOWN_DATABASE_ID_STORAGE_KEY)
  if (!raw) return null
  try {
    return normalizeId(JSON.parse(raw))
  } catch (err) {
    console.warn('Failed to parse stored known database selection', err)
    return null
  }
}

export function readSelectedKnownDatabaseIdFromQuery (
  query?: Record<string, string | number> | null | undefined
): string | null {
  if (!query) return null
  return normalizeId(query[SELECTED_KNOWN_DATABASE_QUERY_KEY])
}

export function readSelectedKnownDatabaseIdFromUrl (hash?: string): string | null {
  if (typeof window === 'undefined' && typeof hash !== 'string') return null
  const source = typeof hash === 'string' ? hash : window.location.hash
  if (!source) return null

  const trimmed = source.startsWith('#') ? source.slice(1) : source
  const search = trimmed.startsWith('?') ? trimmed.slice(1) : trimmed
  if (!search) return null

  const params = new URLSearchParams(search)
  return normalizeId(params.get(SELECTED_KNOWN_DATABASE_QUERY_KEY))
}

export function resolveActiveKnownDatabase (
  databases: KnownDatabase[],
  preferredId?: string | null
): KnownDatabase | null {
  if (databases.length === 0) return null
  const normalizedId = normalizeId(preferredId)
  if (normalizedId) {
    const match = databases.find(database => database.id === normalizedId)
    if (match) return match
  }
  return databases[0]
}

function createId (): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 12)
}

function normalizeId (value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return null
}
