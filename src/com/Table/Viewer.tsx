import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useStateMachine } from 'ygdrassil'
import { db } from '../../db'
import { loadSchema, primaryKeyField } from '../../schema'
import type { Table as DexieTable } from 'dexie'

export default function TableViewer() {
  const { query } = useStateMachine()
  const tableName = String(query.id || '')
  const table: DexieTable<unknown, unknown> | null = tableName ? db.table(tableName) : null
  const records = useLiveQuery(() => table?.toArray() ?? [], [table])
  const [pkField, setPkField] = useState<string | null>(null)

  useEffect(() => {
    loadSchema().then(sch => {
      const spec = sch[tableName]
      setPkField(spec ? primaryKeyField(spec) : null)
    })
  }, [tableName])

  const addRecord = async () => {
    if (!table || !pkField) return
    const json = prompt('New record (JSON)?', '{}')
    if (!json) return
    try {
      const rec = JSON.parse(json) as Record<string, unknown>
      if (!rec[pkField]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rec as any)[pkField] = crypto.randomUUID()
      }
      await table.add(rec as unknown)
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
