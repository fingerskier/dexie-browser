import {useEffect, useState} from 'react'
import DB from 'DB'


export default function Tables() {
  const [tables, setTables] = useState()
  
  
  useEffect(() => {
    if (DB) {
      const newTables = DB.tables
        .filter(table=>(
          !table.name.startsWith('$')
          // && (table.name !== 'members')
          // && (table.name !== 'roles')
          // && (table.name !== 'realms')
          // && (table.name !== 'users')
        ))
      
      console.log('newtables', newTables)
      setTables(newTables)
    } 
  }, [DB])
  
  
  useEffect(() => {
    console.log('tables', tables)
  }, [tables])
  
  
  return <div>
    Tables
    
    <ul>
      {tables && tables
        .map((table,I) => 
        <li key={I}>
          <a href={`?name=${table.name}#table`}>
            {table.name}
          </a>
        </li>
      )}
      {/* <li> <a href='?name=members#members'> Members </a> </li>
      <li> <a href='?name=members#roles'> Roles </a> </li>
      <li> <a href='?name=members#realms'> Realms </a> </li>
      <li> <a href='?name=members#users'> Users </a> </li> */}
    </ul>
  </div>
}