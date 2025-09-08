import { useState, useEffect } from 'react'
import type { DexieCloudOptions } from 'dexie-cloud-addon'
import { initDb } from '../db'

interface Connection {
  name: string
  options: DexieCloudOptions
  lastUsed: number
}

const STORAGE_KEY = 'dexieConnections'

function loadConnections (): Connection[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Connection[]) : []
  } catch {
    return []
  }
}

function saveConnections (conns: Connection[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conns))
}

export default function ConnectionManager ({ children }: { children: React.ReactNode }) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', databaseUrl: '' })

  useEffect(() => {
    const list = loadConnections().sort((a, b) => b.lastUsed - a.lastUsed)
    setConnections(list)
  }, [])

  useEffect(() => {
    if (!connected && connections.length) {
      connect(connections[0])
    }
  }, [connections, connected])

  function connect (conn: Connection) {
    setError(null)
    initDb(conn.options).then(() => {
      setConnected(true)
      setConnections(prev => {
        const updated = [
          { ...conn, lastUsed: Date.now() },
          ...prev.filter(c => c.name !== conn.name)
        ]
        saveConnections(updated)
        return updated
      })
    }).catch(err => {
      setError(String(err))
    })
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const conn: Connection = {
        name: form.name || form.databaseUrl,
        options: { databaseUrl: form.databaseUrl },
        lastUsed: Date.now()
      }
      setConnections(prev => {
        const updated = [conn, ...prev]
        saveConnections(updated)
        return updated
      })
      connect(conn)
    } catch (err) {
      setError(String(err))
    }
  }

  if (!connected) {
    return <div>
      <h2>Connect to Dexie Cloud</h2>
      {error && <p>{error}</p>}
      {connections.length > 0 && <div>
        <h3>Saved Connections</h3>
        <ul>
          {connections.map(c => <li key={c.name}>
            <button onClick={() => connect(c)}>{c.name}</button>
          </li>)}
        </ul>
      </div>}
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Database URL"
          value={form.databaseUrl}
          onChange={e => setForm({ ...form, databaseUrl: e.target.value })}
        />
        <button type="submit">Connect</button>
      </form>
    </div>
  }

  return <>{children}</>
}

