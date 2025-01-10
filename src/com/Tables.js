import React from 'react'
import {useLiveQuery} from 'dexie-react-hooks'
import DB from 'DB'


export default function Tables() {
  console.log('DB', DB)
  const data = useLiveQuery(() => {
    DB.tables.toArray()
  }, [])
  
  
  return <div>
    Tables
    
    <pre>
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
}