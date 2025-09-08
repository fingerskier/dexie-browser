import { useState, useEffect } from 'react'
import type { DexieCloudOptions } from 'dexie-cloud-addon'
import { initDb } from '../db'

export default function ConnectionManager ({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/dexie-cloud.json')
      .then(resp => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        return resp.json()
      })
      .then((opts: DexieCloudOptions) => initDb(opts))
      .then(() => setConnected(true))
      .catch(err => setError(String(err)))
  }, [])

  if (!connected) {
    return <div>
      <h2>Connecting to Dexie Cloud</h2>
      {error && <p>{error}</p>}
    </div>
  }

  return <>{children}</>
}

