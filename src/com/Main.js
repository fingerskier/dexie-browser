import {useEffect, useState} from 'react'
import Tables from 'com/Tables/Tables'
import useLocalStorage from 'hook/useLocalStorage'
import useSimpleRouter from 'hook/useSimpleRouter'
import {KEY,SCREEN} from 'K'
import DB from 'DB'
import Generic from 'com/Tables/Generic'
import Members from 'com/Tables/Members'
import Roles from 'com/Tables/Roles'
import Users from 'com/Tables/Users'
import Realms from 'com/Tables/Realms'


export default function Main() {
  const [appName] = useLocalStorage(KEY.APP_NAME)
  const [dexieUrl] = useLocalStorage(KEY.DEXIE_URL)
  
  const {context, Route} = useSimpleRouter()
  
  
  useEffect(() => {
    console.log('Main', appName, dexieUrl, DB)
  }, [appName, dexieUrl])
  
  
  return <main>
    {/* {DB? <> */}
      Database is ready
      
      <Route path='tables' element={<Tables />} />
      
      <Route path='table' element={<Generic />}>
        <Route path='members' element={<div>Members</div>} />
        
        <Route path='roles' element={<div>Roles</div>} />

        <Route path='users' element={<div>Users</div>} />

        <Route path='realms' element={<div>Realms</div>} />
      </Route>
      
      {/* {!context?.[0]?.length && <ul>
        <li>
          <a href='#tables'>Tables</a>
        </li>
      </ul>}
      
      {context[0]===SCREEN.TABLES && <Tables />}
    </> : <>
      <button>Initialize Database</button>
    </> } */}
  </main>
}