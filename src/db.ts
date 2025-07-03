import Dexie from 'dexie'
import type { Table } from 'dexie'
import dexieCloud, { DexieCloudOptions } from 'dexie-cloud-addon'
import dexieConfig from '../dexie-cloud.json' assert { type: 'json' }

const schema = {
  version: 2,
  stores: {
    // compound index: unique uuid, plus quick per‑user chronological queries
    dataItems: '&uuid, userId, timestamp, name, value, [userId+timestamp]'
  }
}

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

export async function initDb () {
  // Dexie Cloud wants DexieCloudOptions, not just a bare string
  const config = dexieConfig as { databaseUrl?: string; dbUrl?: string }
  const opts: DexieCloudOptions = {
    ...dexieConfig,
    // map legacy "dbUrl" -> "databaseUrl" if necessary
    databaseUrl: config.databaseUrl ?? config.dbUrl
  }

  if (!opts.databaseUrl) {
    throw new Error('dexie-cloud.json must include "databaseUrl"')
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
  await initDb()
  await db.cloud.login(hints)
}
