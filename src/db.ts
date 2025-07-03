import Dexie from 'dexie'
import type { Table } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

const schema = {
  version: 2,
  stores: {
    dataItems: "&uuid, userId, timestamp, name, value, [userId+timestamp]"
  }
}


export interface DataItem {
  uuid: string
  userId: number
  timestamp: number
  name: string
  value: string
}


class AppDB extends Dexie {
  dataItems!: Table<DataItem, string>

  constructor() {
    super('dexie-browser', {
      addons: [dexieCloud],
      autoOpen: false,
    })
    this.version(schema.version).stores(schema.stores)
  }
}


export const db = new AppDB()

let initPromise: Promise<void> | null = null

export async function initDb() {
  if (!initPromise) {
    initPromise = fetch('/dexie-cloud.json')
      .then(r => r.json())
      .then(async opts => {
        db.cloud.configure(opts)
        await db.open()
      })
  }
  return initPromise
}

declare global {
  interface Window {
    db: AppDB
  }
}

window.db = db // Expose db for debugging in browser console

export async function login(hints?: { email?: string }) {
  await initDb()
  await db.cloud.login(hints)
}
