import { useEffect, useState } from 'react'
import { init } from '@a2ui/core'

export default function App() {
  const [storeState, setStoreState] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const store = init()
    const state = store.getState()
    
    // 展示store状态（排除方法，只展示数据）
    const displayState = {
      surfaceMap: state.surfaceMap,
      hydrateNodeMap: state.hydrateNodeMap,
      errorMap: state.errorMap
    }
    
    setStoreState(displayState)
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>A2UI Playground</h1>
      <h2>Store State</h2>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px',
        overflow: 'auto'
      }}>
        {storeState ? JSON.stringify(storeState, null, 2) : 'Loading...'}
      </pre>
    </div>
  )
}
