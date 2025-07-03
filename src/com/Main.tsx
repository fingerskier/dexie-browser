import {StateMachine, State} from 'ygdrassil'
import Record from './Record'
import Navigator from './Navigator'
import User from './User'
import Table from './Table'


export default function Main() {
  return <main>
    <StateMachine name="dexie" initial="tables">
      <Navigator />

      <State name="users">
        <User.List />
      </State>
      <State name="user">
        <User.Edit />
      </State>
      <State name="tables">
        <Table.List />
      </State>
      <State name="table">
        <Table.Edit />
      </State>
      <State name="data">
        <Record.List />
      </State>
      <State name="record">
        <Record.Edit />
      </State>
    </StateMachine>
  </main>
}
