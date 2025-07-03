import Dexie from 'dexie'
import type { Table } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

const schema = {
  version: 1,
  stores: {
    dataItems: "&uuid, userId, timestamp, name, value, [userId+timestamp]"
  }
}


export interface User {
  id?: number
  name: string
  email: string
}


export interface DataItem {
  uuid: string
  userId: number
  timestamp: number
  name: string
  value: string
}


class AppDB extends Dexie {
  users!: Table<User, number>
  dataItems!: Table<DataItem, string>

  constructor() {
    super('dexie-browser', {
      addons: [dexieCloud],
      autoOpen: true,
    })
    this.version(schema.version).stores(schema.stores)
  }
}


export const db = new AppDB()

window.db = db // Expose db for debugging in browser console

export async function login(hints?: { email?: string }) {
  await db.cloud.login(hints)
}
