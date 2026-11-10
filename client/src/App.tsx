import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Temperature from '../pages/temperature/temperature'
import Humidite from '../pages/humidite/humidite'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/temperature" element={<Temperature />} />
        <Route path="/humidite" element={<Humidite />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App