import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Exercise from './pages/Exercise'
import PatientProfile from './pages/PatientProfile'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exercise" element={<Exercise />} />
            <Route path="/profile/:patientId" element={<PatientProfile />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App
