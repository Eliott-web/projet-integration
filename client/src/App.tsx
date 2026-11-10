import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Temperature from '../pages/temperature/temperature'
import Humidite from '../pages/humidite/humidite'
import Fenetre from '../pages/fenetre/fenetre'
import Dashboard from '../pages/dashboard/dashboard'
import Luminosite from '../pages/luminosite/luminosite'
import Control from '../pages/control/control'
import Notification from '../pages/notification/notification'
import Pompe from '../pages/pompe/pompe'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/temperature" element={<Temperature />} />
        <Route path="/humidite" element={<Humidite />} />
        <Route path="/fenetre" element={<Fenetre />} />
        <Route path="/luminosite" element={<Luminosite />} />
        <Route path="/control" element={<Control />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/pompe" element={<Pompe />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App