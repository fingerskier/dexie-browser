import {
  credentialsAreComplete,
  fetchDexieCloudSchema,
  loadStoredCredentials
} from './lib/dexieCloudApi'

export type Schema = Record<string, string>

let cached: Schema | undefined

export async function loadSchema (): Promise<Schema> {
  if (cached) return cached

  const credentials = loadStoredCredentials()
  if (credentialsAreComplete(credentials)) {
    try {
      const schema = await fetchDexieCloudSchema(credentials)
      cached = schema
      return cached
    } catch (err) {
      console.warn('Failed to load schema from Dexie Cloud export', err)
    }
  }

  try {
    const resp = await fetch('/export.json')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = await resp.json()
    cached = json.schema ?? {}
  } catch (err) {
    console.warn('Failed to load schema from export.json', err)
    cached = {}
  }
  return cached as Schema
}

export function primaryKeyField (spec: string): string {
  const pk = spec.split(',')[0].trim()
  return pk.replace(/^(&|\++|\*)/, '').replace(/\[.*\]/, '').split('+')[0]
}
