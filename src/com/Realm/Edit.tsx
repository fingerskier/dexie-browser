import { useLiveQuery } from 'dexie-react-hooks'
import { useStateMachine } from 'ygdrassil'
import { db } from '../../db'

export default function RealmEdit() {
  const { query } = useStateMachine()
  const id = String(query.id)
  const realm = useLiveQuery(() => db.realms.get(id), [id])

  if (!realm) return <div>Loading...</div>

  return (
    <div>
      <h2>{realm.name || realm.realmId}</h2>
      <div>Realm ID: {realm.realmId}</div>
      {realm.owner && <div>Owner: {realm.owner}</div>}
    </div>
  )
}
