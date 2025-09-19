import type { DexieCloudOptions } from 'dexie-cloud-addon'
import type { TokenFinalResponse } from 'dexie-cloud-common'

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

export type DexieCloudSchemaDefinition = Record<string, string>

export interface DexieCloudRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  parseJson?: boolean
}

export function mergeWithDefaultCredentials (
  value?: Partial<DexieCloudCredentials> | null
): DexieCloudCredentials {
  return {
    ...DEFAULT_CREDENTIALS,
    ...value
  }
}

export function loadStoredCredentials (): DexieCloudCredentials | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(DEXIE_CLOUD_CREDENTIAL_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<DexieCloudCredentials>
    return mergeWithDefaultCredentials(parsed)
  } catch (err) {
    console.warn('Failed to parse stored Dexie Cloud credentials', err)
    return null
  }
}

export function credentialsAreComplete (
  credentials: DexieCloudCredentials | null
): credentials is DexieCloudCredentials {
  return Boolean(credentials?.databaseUrl && credentials.databaseUrl.trim().length > 0)
}

export function createDexieCloudOptions (
  credentials: DexieCloudCredentials
): DexieCloudOptions {
  const baseUrl = normalizeBaseUrl(credentials.databaseUrl)
  const options: DexieCloudOptions = {
    databaseUrl: baseUrl,
    customLoginGui: true
  }

  const defaultEmail = optionalString(credentials.defaultEmail)
  if (defaultEmail) {
    options.requireAuth = { email: defaultEmail }
  } else if (credentials.requireAuth) {
    options.requireAuth = true
  }

  if (typeof credentials.tryUseServiceWorker === 'boolean') {
    options.tryUseServiceWorker = credentials.tryUseServiceWorker
  }
  if (typeof credentials.disableWebSocket === 'boolean') {
    options.disableWebSocket = credentials.disableWebSocket
  }
  if (typeof credentials.disableEagerSync === 'boolean') {
    options.disableEagerSync = credentials.disableEagerSync
  }

  if (
    typeof credentials.periodicSyncIntervalMinutes === 'number' &&
    !Number.isNaN(credentials.periodicSyncIntervalMinutes) &&
    credentials.periodicSyncIntervalMinutes > 0
  ) {
    options.periodicSync = {
      minInterval: credentials.periodicSyncIntervalMinutes * 60
    }
  }

  const clientId = optionalString(credentials.clientId)
  const clientSecret = optionalString(credentials.clientSecret)
  const tokenUrl = optionalString(credentials.tokenUrl)
  const audience = optionalString(credentials.audience)

  if (clientId && clientSecret) {
    const endpoint = buildAbsoluteUrl(tokenUrl ?? '/token', baseUrl)
    options.fetchTokens = async ({ public_key, hints }) => {
      const payload: Record<string, unknown> = {
        client_id: clientId,
        client_secret: clientSecret,
        public_key,
        hints,
        grant_type: 'client_credentials'
      }
      if (audience) {
        payload.audience = audience
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const detail = await response.text().catch(() => response.statusText)
        throw new Error(`Token request failed (${response.status}): ${detail}`)
      }
      return await response.json() as TokenFinalResponse
    }
  }

  return options
}

export async function dexieCloudRequest<T> (
  credentials: DexieCloudCredentials,
  path: string,
  { query, body, parseJson, headers, ...init }: DexieCloudRequestOptions = {}
): Promise<T> {
  const baseUrl = normalizeBaseUrl(credentials.databaseUrl)
  const url = new URL(resolvePath(path), ensureTrailingSlash(baseUrl))

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }

  const mergedHeaders = new Headers(headers)
  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    typeof body !== 'string' &&
    !mergedHeaders.has('Content-Type')
  ) {
    mergedHeaders.set('Content-Type', 'application/json')
  }

  if (credentials.apiKey && !mergedHeaders.has('X-Api-Key')) {
    mergedHeaders.set('X-Api-Key', credentials.apiKey)
  }
  if (credentials.accessToken && !mergedHeaders.has('Authorization')) {
    mergedHeaders.set('Authorization', `Bearer ${credentials.accessToken}`)
  }

  const requestInit: RequestInit = {
    ...init,
    headers: mergedHeaders
  }

  if (body !== undefined) {
    if (
      mergedHeaders.get('Content-Type') === 'application/json' &&
      typeof body !== 'string' &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      !(body instanceof URLSearchParams)
    ) {
      requestInit.body = JSON.stringify(body)
    } else {
      requestInit.body = body as BodyInit
    }
  }

  const response = await fetch(url.toString(), requestInit)
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText)
    throw new Error(`Dexie Cloud request failed (${response.status}): ${detail}`)
  }

  if (requestInit.method === 'HEAD' || response.status === 204) {
    return undefined as T
  }

  const shouldParseJson = parseJson ?? true
  if (!shouldParseJson) {
    return await response.text() as unknown as T
  }

  try {
    const clone = response.clone()
    return await clone.json() as T
  } catch {
    const fallback = await response.text().catch(() => '')
    throw new Error(
      fallback
        ? `Failed to parse JSON response: ${fallback}`
        : 'Failed to parse JSON response'
    )
  }
}

export async function fetchDexieCloudSchema (
  credentials: DexieCloudCredentials
): Promise<DexieCloudSchemaDefinition> {
  const path = optionalString(credentials.exportPath) ?? '/export'
  const result = await dexieCloudRequest<{ schema?: DexieCloudSchemaDefinition } | DexieCloudSchemaDefinition>(
    credentials,
    path,
    {
      query: { format: 'json' }
    }
  )

  if (result && typeof result === 'object' && 'schema' in result) {
    const schema = (result as { schema?: DexieCloudSchemaDefinition }).schema
    if (schema && typeof schema === 'object') {
      return schema
    }
  }

  if (result && typeof result === 'object') {
    return result as DexieCloudSchemaDefinition
  }

  throw new Error('Dexie Cloud export did not include a schema description')
}

export function ensureTrailingSlash (url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

function normalizeBaseUrl (url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    throw new Error('Dexie Cloud database URL is required')
  }
  return trimmed.replace(/\/+$/, '')
}

function resolvePath (path: string): string {
  if (!path) return '/' // default to root
  return path.startsWith('/') ? path : `/${path}`
}

function buildAbsoluteUrl (maybeRelative: string, baseUrl: string): string {
  try {
    return new URL(maybeRelative, ensureTrailingSlash(baseUrl)).toString()
  } catch {
    return ensureTrailingSlash(baseUrl) + maybeRelative.replace(/^\//, '')
  }
}

function optionalString (value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
