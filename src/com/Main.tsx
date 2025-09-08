import {StateMachine, State} from 'ygdrassil'
import Record from './Record'
import Navigator from './Navigator'
import User from './User'
import Table from './Table'
import Role from './Role'
import Realm from './Realm'

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
        <Table.Viewer />
      </State>
      <State name="table-edit">
        <Table.Edit />
      </State>
      <State name="record">
        <Record.Edit />
      </State>
      <State name="roles">
        <Role.List />
      </State>
      <State name="role">
        <Role.Edit />
      </State>
      <State name="realms">
        <Realm.List />
      </State>
      <State name="realm">
        <Realm.Edit />
      </State>
    </StateMachine>
  </main>
}
