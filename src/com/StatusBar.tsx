import { useEffect, useState } from 'react'
import { db, login } from '../db'

interface SyncState {
  status: string
}

export default function StatusBar () {
  const [dbStatus] = useState(db.isOpen() ? 'open' : 'closed')
  const [syncStatus, setSyncStatus] = useState<string>(db.cloud?.syncState?.value?.status || 'unknown')
  const [user, setUser] = useState(db.cloud?.currentUser?.value)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const syncSub = db.cloud.syncState.subscribe((s: SyncState) => setSyncStatus(s.status))
    const userSub = db.cloud.currentUser.subscribe(u => setUser(u))
    return () => {
      syncSub.unsubscribe()
      userSub.unsubscribe()
    }
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await login({ email })
    setEmail('')
  }

  const roles = (user?.claims && user.claims.roles) || []
  const roleList = Array.isArray(roles)
    ? roles.join(', ')
    : typeof roles === 'object'
      ? Object.keys(roles).join(', ')
      : ''

  return (
    <div className="status-bar">
      <span>db: {dbStatus}</span>
      <span>cloud: {syncStatus}</span>
      {user?.isLoggedIn ? (
        <span>
          user: {user.name || user.email || user.userId}
          {roleList && ` (${roleList})`}
        </span>
      ) : (
        <form onSubmit={submit} className="login-form">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  )
}

