import { useState, useEffect } from "react"
import Dexie from "dexie"
import dexieCloud from "dexie-cloud-addon"
import useLocalStorage from "./useLocalStorage"
import {KEY} from 'K'

const defaultSchema = {
  realms: '@realmId',
  members: '@id,[realmId+email],userId',
  roles: "[realmId+name]",
  users: '@id,name,email,phone',
}

// Singleton instance
let DB = null


export default function useDexie() {
  const [appName] = useLocalStorage(KEY.APP_NAME)
  const [dexieURL] = useLocalStorage(KEY.DEXIE_URL)
  
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(!!DB)
  const [schema, setSchema] = useState(defaultSchema)
  
  
  const initialize = async (
    url, 
    name = 'default-database', 
    schema = defaultSchema
  ) => {
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
        setIsInitialized(true)
        setError(null)
      }
    } catch (err) {
      console.error('Failed to initialize database:', err)
      setError(err)
      setIsInitialized(false)
      DB = null; // Reset the singleton on error
    }
  }
  
  // Cleanup on unmount - only close if no other components are using it
  useEffect(() => {
    if (!DB) {
      if (appName && dexieURL && schema) {
        initialize(dexieURL, appName, schema)
      }
    }
    
    
    return () => {
      // You might want to implement a reference counting mechanism here
      // if you need to track when it's truly safe to close the connection
    }
  }, [appName, dexieURL, schema])

  return {
    DB,  // Now returning the uppercase DB to match your original
    initialize,
    isInitialized,
    error,
    setSchema,
  }
}