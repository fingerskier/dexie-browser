import {useState} from 'react'
import useLocalStorage from 'hook/useLocalStorage'
import {KEY} from 'K'


export default function Header() {
  const [name, setName] = useLocalStorage(KEY.APP_NAME, 'Dexie-Browser')

  const [editing, setEditing] = useState(false)
  
  
  return <header>
    {editing? 
      <input value={name} onChange={e => setName(e.target.value)} onBlur={() => setEditing(false)} />
    :
      <h1 onClick={() => setEditing(true)}>
        {name}
      </h1>
    }
  </header>
}