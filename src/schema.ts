import {
  credentialsAreComplete,
  fetchDexieCloudSchema,
  loadStoredCredentials,
  type DexieCloudCredentials
} from './lib/dexieCloudApi'

export type Schema = Record<string, string>

let cached: Schema | undefined
let cachedSignature: string | null = null

function createSchemaSignature (credentials: DexieCloudCredentials | null): string | null {
  if (!credentialsAreComplete(credentials)) return null
  return JSON.stringify({
    databaseUrl: credentials.databaseUrl.trim(),
    apiKey: normalizeOptional(credentials.apiKey),
    accessToken: normalizeOptional(credentials.accessToken),
    exportPath: normalizeOptional(credentials.exportPath)
  })
}

function normalizeOptional (value?: string | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function loadSchema (): Promise<Schema> {
  const credentials = loadStoredCredentials()
  const signature = createSchemaSignature(credentials)
  const normalizedSignature = signature ?? 'fallback'

  if (cached && cachedSignature === normalizedSignature) {
    return cached
  }

  if (credentialsAreComplete(credentials)) {
    try {
      const schema = await fetchDexieCloudSchema(credentials)
      cached = schema
      cachedSignature = normalizedSignature
      return cached
    } catch (err) {
      console.warn('Failed to load schema from Dexie Cloud export', err)
      if (cached && cachedSignature === 'fallback') {
        return cached
      }
    }
  }

  if (!cached || cachedSignature !== 'fallback') {
    try {
      const resp = await fetch('/export.json')
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const json = await resp.json()
      cached = json.schema ?? {}
    } catch (err) {
      console.warn('Failed to load schema from export.json', err)
      cached = {}
    }
  }

  cachedSignature = 'fallback'
  return cached as Schema
}

export function primaryKeyField (spec: string): string {
  const pk = spec.split(',')[0].trim()
  return pk.replace(/^(&|\++|\*)/, '').replace(/\[.*\]/, '').split('+')[0]
}
