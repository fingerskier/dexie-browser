import { useEffect, useRef, useState } from 'react'
import type { DexieCloudOptions } from 'dexie-cloud-addon'
import { initDb } from '../db'
import {
  DEXIE_CLOUD_CREDENTIAL_STORAGE_KEY,
  createDexieCloudOptions,
  credentialsAreComplete,
  loadStoredCredentials
} from '../lib/dexieCloudApi'
import Settings from './Settings'

export default function ConnectionManager ({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const lastCredentialSignature = useRef<string | null>(null)

  useEffect(() => {
    let disposed = false
    let pending = false

    const connect = async (force = false) => {
      if (pending) return
      pending = true
      setLoading(true)
      setError(null)

      try {
        const credentials = loadStoredCredentials()
        if (!credentialsAreComplete(credentials)) {
          if (!disposed) {
            setConnected(false)
            setError('Dexie Cloud credentials are not configured. Use the Settings view to provide them.')
          }
          return
        }

        const signature = JSON.stringify(credentials)
        const shouldForce = force || lastCredentialSignature.current !== signature
        const options: DexieCloudOptions = createDexieCloudOptions(credentials)
        await initDb(options, { force: shouldForce })
        if (!disposed) {
          lastCredentialSignature.current = signature
          setConnected(true)
          setError(null)
        }
      } catch (err) {
        if (!disposed) {
          setConnected(false)
          setError(err instanceof Error ? err.message : String(err))
        }
      } finally {
        pending = false
        if (!disposed) {
          setLoading(false)
        }
      }
    }

    connect()

    const handleStorageChange = (event: StorageEvent | CustomEvent<{ key: string }>) => {
      const key = event instanceof StorageEvent ? event.key : event.detail?.key
      if (!key || key !== DEXIE_CLOUD_CREDENTIAL_STORAGE_KEY) return
      void connect(true)
    }

    window.addEventListener('storage', handleStorageChange as EventListener)
    window.addEventListener('localStorageUpdate', handleStorageChange as EventListener)

    return () => {
      disposed = true
      window.removeEventListener('storage', handleStorageChange as EventListener)
      window.removeEventListener('localStorageUpdate', handleStorageChange as EventListener)
    }
  }, [])

  if (!connected) {
    return <div className="connection-gate">
      <h2>Dexie Cloud Connection</h2>
      {loading ? <p>Connecting to Dexie Cloud…</p> : <p>Not connected.</p>}
      {error && <p>{error}</p>}
      <Settings />
    </div>
  }

  return <>{children}</>
}

