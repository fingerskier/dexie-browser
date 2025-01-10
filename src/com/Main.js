import React from 'react'
import useLocalStorage from 'hook/useLocalStorage'
import useSimpleRouter from 'hook/useSimpleRouter'
import useDexie from 'hook/useDexie'
import {KEY} from 'K'


export default function Main() {
  const [appName] = useLocalStorage(KEY.APP_NAME)
  const [dexieUrl] = useLocalStorage(KEY.DEXIE_URL)
  
  const {context} = useSimpleRouter()
  
  const {DB, initialize} = useDexie()
  
  
  return <main>
    {DB? 
      'Database is ready'
    :
      <button onClick={() => initialize(dexieUrl,appName)}>Initialize Database</button>
    }
    
    {DB && <>
      {!context?.[0]?.length && <ul>
        <li>
          <a href='#tables'>Tables</a>
        </li>
      </ul>}
      
      {context[0]==='' && <></>}
    </>}
  </main>
}