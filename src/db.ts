import Dexie from 'dexie'
import dexieCloud from 'dexie-cloud-addon'
import type { DexieCloudOptions } from 'dexie-cloud-addon'
import { loadSchema } from './schema'

export let db: Dexie

export async function initDb (opts: DexieCloudOptions, options: { force?: boolean } = {}) {
  if (!opts.databaseUrl) {
    throw new Error('databaseUrl is required')
  }

  if (db?.isOpen()) {
    const currentUrl = db.cloud?.options?.databaseUrl
    if (!options.force && currentUrl === opts.databaseUrl) {
      return
    }
    db.close()
  } else if (db) {
    db.close()
  }

  const stores = await loadSchema()
  db = new Dexie('dexie-browser', {
    addons: [dexieCloud],
    autoOpen: false
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db.version(1).stores(stores as any)

  db.cloud.configure(opts)
  await db.open()

  if (typeof window !== 'undefined') {
    window.db = db
  }
}

declare global {
  interface Window { db: Dexie }
}

export async function login (hints?: { email?: string }) {
  if (!db?.isOpen()) {
    throw new Error('Database not initialized')
  }
  await db.cloud.login(hints)
}
