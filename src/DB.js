import Dexie from "dexie"
import dexieCloud from "dexie-cloud-addon"

let DB


export async function initialize(url, name='default-database') {
  DB = new Dexie(name, {addons: [dexieCloud]})
  
  DB.version(1).stores({
    realms: '@realmId',
    members: '@id,[realmId+email],userId',
    roles: "[realmId+name]",
    
    users: '@id,name,email,phone',
  })
  
  DB.cloud.configure({
    databaseUrl: url,
    requireAuth: true,
    realms: true,
  })
}


export default DB