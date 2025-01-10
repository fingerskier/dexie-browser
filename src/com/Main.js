import {useEffect, useState} from 'react'
import Tables from 'com/Tables'
import useLocalStorage from 'hook/useLocalStorage'
import useSimpleRouter from 'hook/useSimpleRouter'
import {KEY,SCREEN} from 'K'
import {initialize} from 'DB'


export default function Main() {
  const [appName] = useLocalStorage(KEY.APP_NAME)
  const [dexieUrl] = useLocalStorage(KEY.DEXIE_URL)
  
  const {context} = useSimpleRouter()
  
  const [initialized, setInitialized] = useState(false)
  
  
  useEffect(() => {
    if (appName && dexieUrl) {
      initialize(dexieUrl,appName)
      .then(res=>setInitialized(true))
      .catch(err=>{
        setInitialized(false)
        console.error(err)
      })
    }
  }, [appName, dexieUrl])
  
  
  return <main>
    {initialized? <>
      Database is ready
      
      {!context?.[0]?.length && <ul>
        <li>
          <a href='#tables'>Tables</a>
        </li>
      </ul>}
      
      {context[0]===SCREEN.TABLES && <Tables />}
    </> : <>
      <button onClick={() => initialize(dexieUrl,appName)}>Initialize Database</button>
    </> }
  </main>
}