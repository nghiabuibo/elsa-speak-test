import { useState } from "react";
import Scripted from "./Scripted";
import UnScripted from "./UnScripted";

function App() {
  const [app, setApp] = useState('scripted')
  // console.log(app)
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setApp('scripted')} style={{ backgroundColor: app === 'scripted' ? '#ddd' : 'initial' }} >Scripted</button>
        &nbsp;&nbsp;
        <button onClick={() => setApp('unscripted')} style={{ backgroundColor: app === 'unscripted' ? '#ddd' : 'initial' }}>Un-Scripted</button>
      </div>
      
      {
        app === 'scripted' && <Scripted />
      }
      {
        app === 'unscripted' && <UnScripted />
      }
    </>
  )
}

export default App;
