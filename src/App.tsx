import Main from './com/Main'
import ConnectionManager from './com/ConnectionManager'
import StatusBar from './com/StatusBar'

import './App.css'


export default function App() {
  return <>
    <header>Dexie.js Data Browser</header>

    <ConnectionManager>
      <Main />
      <footer>
        <StatusBar />
      </footer>
      </ConnectionManager>
  </>
}
