export interface DexieCloudCredentials {
  databaseUrl: string
  apiKey?: string
  accessToken?: string
  clientId?: string
  clientSecret?: string
  tokenUrl?: string
  audience?: string
  requireAuth?: boolean
  defaultEmail?: string
  tryUseServiceWorker?: boolean
  disableWebSocket?: boolean
  disableEagerSync?: boolean
  periodicSyncIntervalMinutes?: number
  exportPath?: string
}

export const DEXIE_CLOUD_CREDENTIAL_STORAGE_KEY = 'dexie-browser/dexie-cloud-credentials'

export const DEFAULT_CREDENTIALS: DexieCloudCredentials = {
  databaseUrl: '',
  apiKey: '',
  accessToken: '',
  clientId: '',
  clientSecret: '',
  tokenUrl: '',
  audience: '',
  requireAuth: false,
  defaultEmail: '',
  tryUseServiceWorker: true,
  disableWebSocket: false,
  disableEagerSync: false,
  periodicSyncIntervalMinutes: undefined,
  exportPath: ''
}

export function mergeWithDefaultCredentials (
  value?: Partial<DexieCloudCredentials> | null
): DexieCloudCredentials {
  return {
    ...DEFAULT_CREDENTIALS,
    ...value
  }
}
