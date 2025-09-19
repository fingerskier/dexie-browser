import {StateButton} from 'ygdrassil'

export default function Navigator() {
  return <div>
    <StateButton to="tables" />
    <StateButton to="users" />
    <StateButton to="realms" />
    <StateButton to="roles" />
    <StateButton to="settings">Settings</StateButton>
  </div>
}
