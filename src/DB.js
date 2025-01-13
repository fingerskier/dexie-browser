import Dexie from "dexie"
import dexieCloud from "dexie-cloud-addon"
import { KEY } from 'K'


class AppDatabase extends Dexie {
  realms
  members
  roles
  users
  
  
  constructor() {
    const appName = JSON.parse(localStorage.getItem(KEY.APP_NAME))
    super(appName, { addons: [dexieCloud] })
    
    const defaultSchema = {
      realms: '@realmId',
      members: '@id,[realmId+email],userId',
      roles: '[realmId+name]',
      users: '@id,name,email,phone',
    }
    
    this.version(1).stores(defaultSchema)
    
    // Initialize table properties
    this.realms = this.table('realms')
    this.members = this.table('members')
    this.roles = this.table('roles')
    this.users = this.table('users')
    
    // Configure cloud settings
    const dexieUrl = JSON.parse(localStorage.getItem(KEY.DEXIE_URL))
    this.configureCloud(dexieUrl)
    
    console.log('Initialized database:', {
      url: dexieUrl,
      appName: appName,
      schema: defaultSchema
    })
  }
  
  
  configureCloud(dexieUrl) {
    this.cloud.configure({
      databaseUrl: dexieUrl,
      requireAuth: true,
      realms: true,
    })
  }
  
  
  // Example helper methods that could be added:
  async getUserByEmail(email) {
    return await this.users.where('email').equals(email).first()
  }
  
  
  async getMembersByRealm(realmId) {
    return await this.members.where('realmId').equals(realmId).toArray()
  }
  
  
  async getRolesByRealm(realmId) {
    return await this.roles.where('realmId').equals(realmId).toArray()
  }
}

// Create and export a singleton instance
const DB = new AppDatabase()
console.log('Dexie DB Instance:', DB)


export default DB