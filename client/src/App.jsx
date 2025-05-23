import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EventCard from "./Components/EventCard"
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EventCard />} />
      </Routes>
    </Router>
  )
}

export default App
