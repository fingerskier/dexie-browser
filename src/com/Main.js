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
    Database is ready
    
    <Route path='' element={<div>Home</div>} />
    
    <Route path='tables' element={<Tables />} />
    
    <Route path='table' element={<Generic />}>
    </Route>
    
    <Route path='members' element={<Members />} />
    
    <Route path='roles' element={<Roles />} />
    
    <Route path='users' element={<Users />} />
    
    <Route path='realms' element={<Realms />} />
  </main>
}