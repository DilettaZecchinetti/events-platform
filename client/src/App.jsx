import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EventsList from "./Components/EventsList"
import './App.css'
import Header from './Components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import EventDetail from './Components/EventDetail'
import StaffDashboard from './Components/StaffDashboard';
import { useUser } from "./context/UserContext";

function App() {
  const { user } = useUser();

  return (
    <Router>
      <Header />
      {user?.role === "staff" && (
        <StaffDashboard />
      )}
      <Routes>
        <Route path="/" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
