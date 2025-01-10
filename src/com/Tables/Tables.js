import {useEffect, useState} from 'react'
import DB from 'DB'


export default function Tables() {
  const [tables, setTables] = useState()
  
  
  useEffect(() => {
    if (DB) {
      setTables(DB.tables)
    } 
  }, [DB])
  
  
  useEffect(() => {
    console.log('tables', tables)
  }, [tables])
  
  
  
  return <div>
    Tables
    
    <ul>
      {tables && tables.map((table,I) => 
        <li key={I}>
          <a href={`?name=${table.name}#table`}>{table.name}</a>
          <a href={`#table/${table.name}`}>{table.name}</a>
        </li>
      )}
    </ul>
  </div>
}