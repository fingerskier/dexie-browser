import { useLiveQuery } from 'dexie-react-hooks'
import { StateLink } from 'ygdrassil'
import { db } from '../../db'

export default function UserList() {
  const users = useLiveQuery(() => db.users.toArray(), [])

  const addUser = async () => {
    const name = prompt('Name?')
    if (!name) return
    const email = prompt('Email?') || ''
    await db.users.add({ name, email })
  }

  const remove = async (id: number) => {
    if (confirm('Delete user?')) await db.users.delete(id)
  }

  return <div>
    <h2>Users</h2>
    <button onClick={addUser}>Add User</button>
    <ul>
      {users?.map(u => (
        <li key={u.id}>
          <StateLink to="user" data={{ id: u.id! }}>{u.name}</StateLink>
          <button onClick={() => remove(u.id!)}>Delete</button>
        </li>
      ))}
    </ul>
  </div>
}

