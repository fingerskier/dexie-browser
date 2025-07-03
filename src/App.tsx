import Main from './com/Main'
import LoginWidget from './com/LoginWidget'

import './App.css'


export default function App() {
  return <>
    <header>Dexie.js Data Browser</header>
    
    <Main />
    
    <footer>
      <LoginWidget />
      <p>Powered by Vite + React</p>
    </footer>
  </>
}
