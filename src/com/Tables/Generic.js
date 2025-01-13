import {useEffect, useState} from 'react'
import useSimpleRouter from 'hook/useSimpleRouter'
import DB from 'DB'
import { useLiveQuery } from 'dexie-react-hooks'


export default function Generic() {
  const {useLiveQuery} = useSimpleRouter()
  
  const {state} = useSimpleRouter()
  
  
  return <div>
    {state?.name && <>
      <h2> {state.name} </h2>
      
      <Contents tableName={state.name} />
    </>}
  </div>
}


function Contents({tableName}) {
  const data = useLiveQuery(async()=>{
    return await DB.table(tableName).toArray()
  })
  
  const [fields, setFields] = useState([])
  
  
  const addRecord = async() => {
    const result = await DB.table(tableName).add({
      name: 'New Record'
    })
  }
  
  
  const editRecord = async(dat)=>{
    let id = dat.id
    
    if (
      (tableName === 'realms')
      || (tableName === 'roles')
    ) id = dat.realmId
    
    window.location = `?table=${tableName}&id=${id}&name=${dat.name}#record`
  }
  
  
  useEffect(() => {
    if (data) {
      const newFields = []
      
      data?.forEach(row => {
        Object.keys(row).forEach(key => {
          if (!newFields.includes(key)) {
            newFields.push(key)
          }
        })
      })
      
      setFields(newFields)
    }
  }, [data])
  
  
  return <div>
    {data && <table>
      <thead>
        <tr>
          {fields.map((field,I) =><th key={I}>
            {field}
          </th>)}
        </tr>
      </thead>
      
      <tbody>
        {data.map((row,I) => 
          <tr key={I} onClick={()=>editRecord(row)}>
            {fields.map((field,J) =><td key={J}>
              {(typeof row[field] === 'object')? 
                JSON.stringify(row[field]) 
              :
                row[field]
              }
            </td>)}
          </tr>
        )}
      </tbody>
    </table>}
    
    <button onClick={addRecord}>Add Record</button>
  </div>
}