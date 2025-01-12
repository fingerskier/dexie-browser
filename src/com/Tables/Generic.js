import {useEffect, useState} from 'react'
import useSimpleRouter from 'hook/useSimpleRouter'
import DB from 'DB'
import { useLiveQuery } from 'dexie-react-hooks'


export default function Generic() {
  const {useLiveQuery} = useSimpleRouter()
  
  const {state} = useSimpleRouter()
  
  
  return <div>
    {state?.name && <>
      Table "{state.name}"
      
      <Contents tableName={state.name} />
    </>}
  </div>
}


function Contents({tableName}) {
  const data = useLiveQuery(async()=>{
    return await DB.table(tableName).toArray()
  })
  
  const [fields, setFields] = useState([])
  
  
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
          <tr key={I}>
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
    
    
  </div>
}


function Editor({fields}) {

}