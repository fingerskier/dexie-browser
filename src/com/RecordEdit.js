import {useEffect, useState} from 'react'
import DB from 'DB'
import { useLiveQuery } from 'dexie-react-hooks'
import useSimpleRouter from 'hook/useSimpleRouter'


export default function RecordEdit() {
  const {state} = useSimpleRouter()
  
  
  return <div>
    <h2> {state.table}</h2>
    :: {state.id} 
    
    {(state.table && state.id)?
      <Edit
        id={state.id} 
        name={state.name}
        tableName={state.table}
      />
    :
      <div>
        Loading...
      </div>
    }
  </div>
}


function Edit({tableName, name, id}) {
  const data = useLiveQuery(async()=>{
    if (tableName === 'realms') {
      return await DB.table(tableName).get({realmId:id})
    } else if (tableName === 'roles') {
      return await DB.table(tableName).get({realmId:id, name:name})
    } else {
      return await DB.table(tableName).get(id)
    }
  })
  
  const [fields, setFields] = useState([])
  const [showRaw, setShowRaw] = useState(false)
  
  
  const save = async(e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const payload = {}
    
    for (let [key, value] of formData.entries()) {
      payload[key] = value
    }
    console.log('payload', payload)
    
    await DB.table(tableName).put(payload)
  }
  
  
  useEffect(() => {
    if (data) {
      const newFields = []
      
      Object.entries(data).forEach(([key, value]) => {
        if (!newFields.includes(key)) {
          newFields.push(key)
        }
      })
      
      setFields(newFields)
    }
  }, [data])
  
  
  return <form
    className="record edit"
    onSubmit={save}
  >
    {fields && fields
      .map((field,I) =>{
        const editable = (
          !field.toLowerCase().includes('id')
          && !field.toLowerCase().includes('owner')
          && !field.toLowerCase().includes('accepted')
        )
        
        const val = (typeof data[field] === 'object')? 
          JSON.stringify(data[field], null, 2): data[field]
        
        return <div key={I}>
          <label htmlFor={`record-edit-${I}`}> {field} </label>
          
          {editable?
            <input id={`record-edit-${I}`}
              name={field}
              type='text' 
              defaultValue={val} 
            />
          :
            <>
              {val}
              
              <input
                defaultValue={val}
                name={field}
                type='hidden'
              />
            </>
          }
        </div>
      }
    )}
    
    <button type='submit'> Save </button>
    
    <div>
      <button
        type='button'
        onClick={()=>setShowRaw(!showRaw)}
      >
        {showRaw? '!' : '?'}
      </button>
      
      {showRaw && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  </form>
}