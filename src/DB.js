import Dexie from "dexie"
import dexieCloud from "dexie-cloud-addon"
import {KEY} from 'K'


const appName = JSON.parse(localStorage.getItem(KEY.APP_NAME))
const defaultSchema = {
  realms: '@realmId',
  members: '@id,[realmId+email],userId',
  roles: "[realmId+name]",
  users: '@id,name,email,phone',
}
const dexieUrl = JSON.parse(localStorage.getItem(KEY.DEXIE_URL))

const DB = new Dexie(appName, { addons: [dexieCloud] })


console.log('Initializing database...', dexieUrl, appName, defaultSchema)

DB.version(1).stores(defaultSchema)


DB.cloud.configure({
  databaseUrl: dexieUrl,
  requireAuth: true,
  realms: true,
})

console.log('Dexie DB', DB)


export default DB