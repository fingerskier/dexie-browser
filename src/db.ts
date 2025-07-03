import Dexie from 'dexie'
import type { Table } from 'dexie'

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
    super('dexie-browser')
    this.version(1).stores(schema.stores)
  }
}

export const db = new AppDB()
