import React from 'react'
import useSimpleRouter from 'hook/useSimpleRouter'
import DB from 'DB'


export default function Generic() {
  const {state} = useSimpleRouter()
  
  
  return <div>
    Table {state?.name}
  </div>
}