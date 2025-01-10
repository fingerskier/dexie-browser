import {useState} from 'react'
import useLocalStorage from 'hook/useLocalStorage'
import {KEY} from 'K'


export default function Footer() {
  const [dexieURL, setDexieURL] = useLocalStorage(KEY.DEXIE_URL, 'dexie-url')
  
  const [editDexieKey, setEditDexieKey] = useState(false)
  
  
  return <footer>
    {editDexieKey?
    
      <input value={dexieURL} onChange={e => setDexieURL(e.target.value)} onBlur={() => setEditDexieKey(false)} />
    :
      <h1 onClick={() => setEditDexieKey(true)}>
        {dexieURL}
      </h1>
    }
  </footer>
}