import { useLiveQuery } from 'dexie-react-hooks'
import { useStateMachine } from 'ygdrassil'
import { db } from '../../db'
import type { Table } from 'dexie'

export default function RecordList() {
  const { query } = useStateMachine()
  const tableName = String(query.id || '')
  const table: Table<unknown, unknown> | null = tableName ? db.table(tableName) : null

  const records = useLiveQuery(() => table?.toArray() ?? [], [table])

  const addRecord = async () => {
    if (!table) return
    const json = prompt('Enter JSON for new item:')
    if (!json) return
    try {
      await table.add(JSON.parse(json) as unknown)
    } catch (err) {
      alert('Failed to add item: ' + err)
    }
  }

  if (!tableName) return <div>No table selected</div>

  return (
    <div>
      <h2>Data for {tableName}</h2>
      <button onClick={addRecord}>Add</button>
      <ul>
        {records?.map((rec, i) => (
          <li key={i}>{JSON.stringify(rec)}</li>
        ))}
      </ul>
    </div>
  )
}
