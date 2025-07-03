import { useEffect, useState } from 'react'
import { db, login } from '../db'

export default function LoginWidget() {
  const [userName, setUserName] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const sub = db.cloud.currentUser.subscribe(u => {
      if (u && u.isLoggedIn) {
        setUserName(u.name || u.email || u.userId || null)
      } else {
        setUserName(null)
      }
    })
    return () => sub.unsubscribe()
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await login({ email })
  }

  if (userName) {
    return <span>Logged in as {userName}</span>
  }

  return (
    <form onSubmit={submit}>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  )
}
