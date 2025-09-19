import { useState } from 'react'
import type { FormEvent } from 'react'
import useLocalStorage from '../hook/useLocalStorage'
import { initDb } from '../db'
import {
  DEFAULT_CREDENTIALS,
  DEXIE_CLOUD_CREDENTIAL_STORAGE_KEY,
  createDexieCloudOptions
} from '../lib/dexieCloudApi'
import type { DexieCloudCredentials } from '../lib/dexieCloudApi'

export default function Settings () {
  const [credentials, setCredentials] = useLocalStorage<DexieCloudCredentials>(
    DEXIE_CLOUD_CREDENTIAL_STORAGE_KEY,
    { ...DEFAULT_CREDENTIALS }
  )
  const [status, setStatus] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  const updateCredentials = (patch: Partial<DexieCloudCredentials>) => {
    setCredentials(prev => ({ ...prev, ...patch }))
  }

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
    setCredentials({ ...DEFAULT_CREDENTIALS })
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
            <span>OAuth client secret</span>
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
