import { DEFAULT_CREDENTIALS, mergeWithDefaultCredentials } from './dexieCloudApi'
import type { DexieCloudCredentials } from './dexieCloudApi'

export interface KnownDatabase {
  id: string
  name: string
  credentials: DexieCloudCredentials
}

export const KNOWN_DATABASES_STORAGE_KEY = 'dexie-browser/known-databases'
export const SELECTED_KNOWN_DATABASE_ID_STORAGE_KEY = 'dexie-browser/known-databases/selected-id'

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

function createId (): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 12)
}
