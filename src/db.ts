import Dexie from 'dexie'
import type { Table } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'
import type { DexieCloudOptions } from 'dexie-cloud-addon'
import { schema } from './schema'

export interface DataItem {
  uuid: string
  userId: string // Dexie Cloud subject id is string, not number
  timestamp: number
  name: string
  value: string
}

class AppDB extends Dexie {
  dataItems!: Table<DataItem, string>

  constructor () {
    super('dexie-browser', {
      addons: [dexieCloud],
      autoOpen: false
    })

    this.version(schema.version).stores(schema.stores)
  }
}

export const db = new AppDB()

export async function initDb (opts: DexieCloudOptions) {
  if (db.isOpen()) return

  if (!opts.databaseUrl) {
    throw new Error('databaseUrl is required')
  }

  db.cloud.configure(opts)
  await db.open()
}

declare global {
  interface Window { db: AppDB }
}

if (typeof window !== 'undefined') {
  window.db = db // for devtools
}

export async function login (hints?: { email?: string }) {
  if (!db.isOpen()) {
    throw new Error('Database not initialized')
  }
  await db.cloud.login(hints)
}
