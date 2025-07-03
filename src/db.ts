import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface User {
  id?: number
  name: string
  email: string
}

class AppDB extends Dexie {
  users!: Table<User, number>

  constructor() {
    super('dexie-browser')
    this.version(1).stores({
      users: '++id, name, email'
    })
  }
}

export const db = new AppDB()
