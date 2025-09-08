import Main from './com/Main'
import LoginWidget from './com/LoginWidget'
import ConnectionManager from './com/ConnectionManager'

import './App.css'


export default function App() {
  return <>
    <header>Dexie.js Data Browser</header>

    <ConnectionManager>
      <Main />
      <footer>
        <LoginWidget />
        <p>Powered by Vite + React</p>
      </footer>
    </ConnectionManager>
  </>
}
