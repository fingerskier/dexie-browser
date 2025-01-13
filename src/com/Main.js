import {useEffect, useState} from 'react'
import Tables from 'com/Tables/Tables'
import useLocalStorage from 'hook/useLocalStorage'
import useSimpleRouter from 'hook/useSimpleRouter'
import {KEY,SCREEN} from 'K'
import DB from 'DB'
import Generic from 'com/Tables/Generic'
import Members from 'com/Tables/Members'
import Metadata from 'com/Metadata'
import Realms from 'com/Tables/Realms'
import Roles from 'com/Tables/Roles'
import Users from 'com/Tables/Users'
import RecordEdit from 'com/RecordEdit'


export default function Main() {
  const [appName] = useLocalStorage(KEY.APP_NAME)
  const [dexieUrl] = useLocalStorage(KEY.DEXIE_URL)
  
  const {context, Route} = useSimpleRouter()
  
  
  return <main>
    <Route path='main' element={<Metadata />} />
    
    <Route path='tables' element={<Tables />} />
    
    <Route path='table' element={<Generic />} />
    
    <Route path='members' element={<Members />} />
    
    <Route path='record' element={<RecordEdit />} />
    
    <Route path='roles' element={<Roles />} />
    
    <Route path='users' element={<Users />} />
    
    <Route path='realms' element={<Realms />} />
  </main>
}