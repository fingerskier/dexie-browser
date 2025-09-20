import { useContext, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import useLocalStorage from '../hook/useLocalStorage'
import { initDb } from '../db'
import {
  DEFAULT_CREDENTIALS,
  DEXIE_CLOUD_CREDENTIAL_STORAGE_KEY,
  createDexieCloudOptions,
  mergeWithDefaultCredentials
} from '../lib/dexieCloudApi'
import type { DexieCloudCredentials } from '../lib/dexieCloudApi'
import {
  KNOWN_DATABASES_STORAGE_KEY,
  SELECTED_KNOWN_DATABASE_ID_STORAGE_KEY,
  SELECTED_KNOWN_DATABASE_QUERY_KEY,
  createKnownDatabase,
  normalizeKnownDatabases,
  readSelectedKnownDatabaseIdFromQuery,
  readSelectedKnownDatabaseIdFromUrl,
  type KnownDatabase
} from '../lib/knownDatabases'
import { StateMachineContext } from 'ygdrassil'

const DEFAULT_DATABASE_NAME = 'New database'

function areCredentialsEqual (
  a: DexieCloudCredentials,
  b: DexieCloudCredentials
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function ensureUniqueName (base: string, names: string[]): string {
  const normalized = new Set(names.map(name => name.trim().toLowerCase()))
  const trimmedBase = base.trim()
  const fallback = trimmedBase.length > 0 ? trimmedBase : DEFAULT_DATABASE_NAME
  if (!normalized.has(fallback.toLowerCase())) {
    return fallback
  }
  let index = 2
  let candidate = `${fallback} ${index}`.trim()
  while (normalized.has(candidate.trim().toLowerCase())) {
    index += 1
    candidate = `${fallback} ${index}`.trim()
  }
  return candidate
}

function guessDatabaseName (
  credentials: DexieCloudCredentials,
  existingNames: string[]
): string {
  const url = credentials.databaseUrl?.trim()
  if (url) {
    try {
      const parsed = new URL(url)
      const base = parsed.hostname || parsed.pathname || url
      return ensureUniqueName(base, existingNames)
    } catch {
      return ensureUniqueName(url, existingNames)
    }
  }
  return ensureUniqueName(DEFAULT_DATABASE_NAME, existingNames)
}

function getDatabaseLabel (database: KnownDatabase): string {
  const name = database.name.trim()
  if (name.length > 0) return name
  const url = database.credentials.databaseUrl.trim()
  if (url.length > 0) return url
  return 'Untitled database'
}

export default function Settings () {
  const stateMachine = useContext(StateMachineContext)
  const machineQuery = stateMachine?.query
  const [credentials, setCredentials] = useLocalStorage<DexieCloudCredentials>(
    DEXIE_CLOUD_CREDENTIAL_STORAGE_KEY,
    { ...DEFAULT_CREDENTIALS }
  )
  const [knownDatabases, setKnownDatabases] = useLocalStorage<KnownDatabase[]>(
    KNOWN_DATABASES_STORAGE_KEY,
    []
  )
  const [selectedDatabaseId, setSelectedDatabaseId] = useLocalStorage<string | null>(
    SELECTED_KNOWN_DATABASE_ID_STORAGE_KEY,
    null
  )
  const [status, setStatus] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const hasKnownDatabases = knownDatabases.length > 0
  const selectedDatabase = hasKnownDatabases
    ? (selectedDatabaseId
      ? knownDatabases.find(database => database.id === selectedDatabaseId) ?? knownDatabases[0]
      : knownDatabases[0])
    : null
  const migrationDoneRef = useRef(false)

  useEffect(() => {
    if (!hasKnownDatabases) return

    const candidate = stateMachine
      ? readSelectedKnownDatabaseIdFromQuery(machineQuery)
      : readSelectedKnownDatabaseIdFromUrl()
    if (!candidate) return

    if (!knownDatabases.some(database => database.id === candidate)) return
    if (selectedDatabaseId === candidate) return
    setSelectedDatabaseId(candidate)
  }, [
    hasKnownDatabases,
    knownDatabases,
    selectedDatabaseId,
    setSelectedDatabaseId,
    machineQuery,
    stateMachine
  ])

  useEffect(() => {
    setKnownDatabases(current => normalizeKnownDatabases(current))
  }, [setKnownDatabases])

  useEffect(() => {
    setCredentials(prev => mergeWithDefaultCredentials(prev))
  }, [setCredentials])

  useEffect(() => {
    if (migrationDoneRef.current) return
    if (knownDatabases.length > 0) {
      migrationDoneRef.current = true
      return
    }

    const normalizedCredentials = mergeWithDefaultCredentials(credentials)
    if (areCredentialsEqual(normalizedCredentials, DEFAULT_CREDENTIALS)) {
      migrationDoneRef.current = true
      return
    }

    const initialDatabase = createKnownDatabase(
      guessDatabaseName(normalizedCredentials, []),
      normalizedCredentials
    )
    migrationDoneRef.current = true
    setKnownDatabases([initialDatabase])
    setSelectedDatabaseId(initialDatabase.id)
    setCredentials(initialDatabase.credentials)
  }, [credentials, knownDatabases.length, setKnownDatabases, setSelectedDatabaseId, setCredentials])

  useEffect(() => {
    if (knownDatabases.length === 0) {
      if (selectedDatabaseId !== null) {
        setSelectedDatabaseId(null)
      }
      return
    }

    const selected = selectedDatabaseId
      ? knownDatabases.find(database => database.id === selectedDatabaseId)
      : undefined
    const activeDatabase = selected ?? knownDatabases[0]

    if (!selected || selectedDatabaseId === null) {
      if (selectedDatabaseId !== activeDatabase.id) {
        setSelectedDatabaseId(activeDatabase.id)
      }
    }

    if (!areCredentialsEqual(credentials, activeDatabase.credentials)) {
      setCredentials(activeDatabase.credentials)
    }
  }, [credentials, knownDatabases, selectedDatabaseId, setCredentials, setSelectedDatabaseId])

  useEffect(() => {
    if (!stateMachine) return
    const currentQueryId = readSelectedKnownDatabaseIdFromQuery(machineQuery)
    const activeId = selectedDatabase?.id ?? null
    if (currentQueryId === activeId) return
    stateMachine.setQuery({
      [SELECTED_KNOWN_DATABASE_QUERY_KEY]: activeId
    })
  }, [machineQuery, selectedDatabase?.id, stateMachine])

  const updateCredentials = (patch: Partial<DexieCloudCredentials>) => {
    setCredentials(prev => {
      const updated = { ...prev, ...patch }
      if (selectedDatabase) {
        const targetId = selectedDatabase.id
        setKnownDatabases(current => current.map(database => (
          database.id === targetId
            ? { ...database, credentials: updated }
            : database
        )))
      }
      return updated
    })
  }

  const handleSelectDatabase = (id: string) => {
    setSelectedDatabaseId(id || null)
    setStatus(null)
  }

  const handleRenameDatabase = (name: string) => {
    if (!selectedDatabase) return
    const targetId = selectedDatabase.id
    setKnownDatabases(current => current.map(database => (
      database.id === targetId
        ? { ...database, name }
        : database
    )))
  }

  const handleAddDatabase = () => {
    setKnownDatabases(current => {
      const existingNames = current.map(database => database.name)
      const name = guessDatabaseName(credentials, existingNames)
      const newDatabase = createKnownDatabase(name, credentials)
      setSelectedDatabaseId(newDatabase.id)
      setCredentials(newDatabase.credentials)
      setStatus(null)
      return [...current, newDatabase]
    })
  }

  const handleDeleteDatabase = () => {
    if (!selectedDatabase) return
    const targetId = selectedDatabase.id
    setKnownDatabases(current => current.filter(database => database.id !== targetId))
    setStatus(null)
  }

  const selectedOptionValue = selectedDatabase?.id ?? selectedDatabaseId ?? (hasKnownDatabases ? knownDatabases[0].id : '')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTesting(true)
    setStatus(null)

    try {
      const options = createDexieCloudOptions(credentials)
      await initDb(options, { force: true })
      setStatus('Connection successful. The database is ready to use.')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus(`Connection failed: ${message}`)
    } finally {
      setTesting(false)
    }
  }

  const handleReset = () => {
    const resetCredentials = mergeWithDefaultCredentials({})
    setCredentials(resetCredentials)
    if (selectedDatabase) {
      const targetId = selectedDatabase.id
      setKnownDatabases(current => current.map(database => (
        database.id === targetId
          ? { ...database, credentials: resetCredentials }
          : database
      )))
    }
    setStatus('Credentials cleared. Update the fields and test the connection again.')
  }

  const handlePeriodicSyncChange = (value: string) => {
    if (value === '') {
      updateCredentials({ periodicSyncIntervalMinutes: undefined })
      return
    }
    const parsed = Number(value)
    updateCredentials({
      periodicSyncIntervalMinutes: Number.isNaN(parsed) ? undefined : parsed
    })
  }

  return (
    <section className="settings">
      <h2>Dexie Cloud Settings</h2>
      <p className="settings-description">
        Provide the credentials for your Dexie Cloud instance. The values are stored locally in
        your browser so they can be reused the next time you open the app.
      </p>
      <form className="settings-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Known databases</legend>
          {hasKnownDatabases ? (
            <>
              <label>
                <span>Saved databases</span>
                <select
                  value={selectedOptionValue}
                  onChange={event => handleSelectDatabase(event.target.value)}
                >
                  {knownDatabases.map(database => (
                    <option key={database.id} value={database.id}>{getDatabaseLabel(database)}</option>
                  ))}
                </select>
              </label>
              {selectedDatabase && (
                <label>
                  <span>Display name</span>
                  <input
                    type="text"
                    placeholder="Database name"
                    value={selectedDatabase.name}
                    onChange={event => handleRenameDatabase(event.target.value)}
                  />
                </label>
              )}
            </>
          ) : (
            <p className="settings-empty">No known databases saved yet. Add one to quickly switch between Dexie Cloud instances.</p>
          )}
          <div className="settings-known-actions">
            <button type="button" onClick={handleAddDatabase}>Add database</button>
            <button
              type="button"
              onClick={handleDeleteDatabase}
              disabled={!hasKnownDatabases}
            >
              Delete selected
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Connection</legend>
          <label>
            <span>Database URL</span>
            <input
              type="url"
              required
              placeholder="https://your-database.dexie.cloud"
              value={credentials.databaseUrl}
              onChange={event => updateCredentials({ databaseUrl: event.target.value })}
            />
          </label>
          <label>
            <span>API Key</span>
            <input
              type="text"
              placeholder="Optional API key"
              value={credentials.apiKey ?? ''}
              onChange={event => updateCredentials({ apiKey: event.target.value })}
            />
          </label>
          <label>
            <span>Access Token</span>
            <input
              type="text"
              placeholder="Bearer token for direct HTTP calls"
              value={credentials.accessToken ?? ''}
              onChange={event => updateCredentials({ accessToken: event.target.value })}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Authentication</legend>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={Boolean(credentials.requireAuth)}
              onChange={event => updateCredentials({ requireAuth: event.target.checked })}
            />
            Require authentication on startup
          </label>
          <label>
            <span>Default login email</span>
            <input
              type="email"
              placeholder="user@example.com"
              value={credentials.defaultEmail ?? ''}
              onChange={event => updateCredentials({ defaultEmail: event.target.value })}
            />
          </label>
          <label>
            <span>OAuth client ID</span>
            <input
              type="text"
              value={credentials.clientId ?? ''}
              onChange={event => updateCredentials({ clientId: event.target.value })}
            />
          </label>
          <label>
            <span>Client secret</span>
            <input
              type="password"
              autoComplete="new-password"
              value={credentials.clientSecret ?? ''}
              onChange={event => updateCredentials({ clientSecret: event.target.value })}
            />
          </label>
          <label>
            <span>Token endpoint</span>
            <input
              type="url"
              placeholder="Defaults to /token"
              value={credentials.tokenUrl ?? ''}
              onChange={event => updateCredentials({ tokenUrl: event.target.value })}
            />
          </label>
          <label>
            <span>Audience</span>
            <input
              type="text"
              value={credentials.audience ?? ''}
              onChange={event => updateCredentials({ audience: event.target.value })}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Sync</legend>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={Boolean(credentials.tryUseServiceWorker)}
              onChange={event => updateCredentials({ tryUseServiceWorker: event.target.checked })}
            />
            Try to use a service worker
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={Boolean(credentials.disableWebSocket)}
              onChange={event => updateCredentials({ disableWebSocket: event.target.checked })}
            />
            Disable WebSocket connections
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={Boolean(credentials.disableEagerSync)}
              onChange={event => updateCredentials({ disableEagerSync: event.target.checked })}
            />
            Disable eager sync
          </label>
          <label>
            <span>Periodic sync interval (minutes)</span>
            <input
              type="number"
              min="0"
              step="1"
              value={credentials.periodicSyncIntervalMinutes ?? ''}
              onChange={event => handlePeriodicSyncChange(event.target.value)}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Schema</legend>
          <label>
            <span>Export path</span>
            <input
              type="text"
              placeholder="/export"
              value={credentials.exportPath ?? ''}
              onChange={event => updateCredentials({ exportPath: event.target.value })}
            />
          </label>
        </fieldset>

        <div className="settings-actions">
          <button type="submit" disabled={testing}>Test &amp; Save</button>
          <button type="button" onClick={handleReset} disabled={testing}>Reset</button>
        </div>
        {status && (
          <p className="settings-status" aria-live="polite">{status}</p>
        )}
      </form>
    </section>
  )
}
