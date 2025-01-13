import {useState} from 'react'
import useLocalStorage from 'hook/useLocalStorage'
import {KEY} from 'K'


export default function Footer() {
  const [dexieURL, setDexieURL] = useLocalStorage(KEY.DEXIE_URL)
  
  const [editDexieKey, setEditDexieKey] = useState(false)
  
  
  return <footer>
    <nav>
      <a href='#main'>Home</a>
      <a href='#tables'>Tables</a>
    </nav>
    
    {editDexieKey?
      <input
        value={dexieURL}
        onChange={e => setDexieURL(e.target.value)} 
        onBlur={() => setEditDexieKey(false)} 
        placeholder='Dexie-Cloud database URL'
      />
    :
      <h3 onClick={() => setEditDexieKey(true)}>
        {dexieURL? dexieURL : 'Click here to enter your Dexie-Cloud database URL'}
      </h3>
    }
  </footer>
}