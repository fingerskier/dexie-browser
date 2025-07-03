import { useLiveQuery } from 'dexie-react-hooks'
import { useStateMachine } from 'ygdrassil'
import { db } from '../../db'

export default function UserEdit() {
  const { query, gotoState } = useStateMachine()
  const id = Number(query.id)
  const user = useLiveQuery(() => db.users.get(id), [id])

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') || '')
    const email = String(formData.get('email') || '')
    await db.users.put({ id, name, email })
    gotoState('users')
  }

  const remove = async () => {
    if (confirm('Delete user?')) {
      await db.users.delete(id)
      gotoState('users')
    }
  }

  if (!user) return <div>Loading...</div>

  return <form onSubmit={save}>
    <div>
      <label>
        Name <input name="name" defaultValue={user.name} />
      </label>
    </div>
    <div>
      <label>
        Email <input name="email" defaultValue={user.email} />
      </label>
    </div>
    <button type="submit">Save</button>
    <button type="button" onClick={remove}>Delete</button>
  </form>
}

