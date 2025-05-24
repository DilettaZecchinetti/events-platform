import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EventCard from "./Components/EventCard"
import './App.css'
import Header from './Components/Header'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<EventCard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
