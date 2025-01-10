import Dexie from "dexie"
import dexieCloud from "dexie-cloud-addon"

const defaultSchema = {
  realms: '@realmId',
  members: '@id,[realmId+email],userId',
  roles: "[realmId+name]",
  users: '@id,name,email,phone',
}


let DB


export async function initialize(
  url, 
  name = 'default-database', 
  schema = defaultSchema
) {
  try {
    // Only initialize if the singleton doesn't exist
    if (!DB) {
      console.log('Initializing database...', url, name, schema)
      
      const db = new Dexie(name, { addons: [dexieCloud] })
      db.version(1).stores(schema)
      
      await db.cloud.configure({
        databaseUrl: url,
        requireAuth: true,
        realms: true,
      })
      
      // Wait for the database to open
      await db.open()
      
      DB = db
    }
  } catch (err) {
    console.error('Failed to initialize database:', err)
    DB = null; // Reset the singleton on error
  }
}


export default DB