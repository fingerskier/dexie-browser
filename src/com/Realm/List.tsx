import { useLiveQuery } from 'dexie-react-hooks'
import { StateLink } from 'ygdrassil'
import { db } from '../../db'

export default function RealmList() {
  const realms = useLiveQuery(async () => {
    const user = db.cloud.currentUser.value
    if (!user?.userId) return []
    const memberships = await db.members.where('userId').equals(user.userId).toArray()
    const realmIds = Array.from(new Set(memberships.map(m => m.realmId)))
    if (!realmIds.length) return []
    const res = await db.realms.bulkGet(realmIds)
    return res.filter((r): r is NonNullable<typeof r> => !!r)
  }, [])

  return (
    <div>
      <h2>Realms</h2>
      <ul>
        {realms?.map(r => (
          <li key={r.realmId}>
            <StateLink to="realm" data={{ id: r.realmId }}>{r.name || r.realmId}</StateLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
