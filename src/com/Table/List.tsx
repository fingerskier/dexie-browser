import { StateLink } from 'ygdrassil'
import { db } from '../../db'

export default function TableList() {
  const hidden = new Set(['users', 'realms', 'roles'])
  const tables = db.tables.filter(t => !t.name.startsWith('$') && !hidden.has(t.name))

  return <div>
    <h2>Tables</h2>
    <ul>
      {tables.map((t, i) => (
        <li key={i}>
          <StateLink to="table" data={{ id: t.name }}>{t.name}</StateLink>
        </li>
      ))}
    </ul>
  </div>
}
