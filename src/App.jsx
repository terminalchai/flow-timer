import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AppTimer from './pages/AppTimer'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<AppTimer />} />
    </Routes>
  )
}
