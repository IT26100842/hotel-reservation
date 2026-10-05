import { useState } from 'react'
import './index.css'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-7xl text-center text-white font-bold font-mono">
          Hotel Reservation System
        </div>
      </section>
    </>
  )
}

export default App
