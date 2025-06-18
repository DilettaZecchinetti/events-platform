import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EventsList from "./Components/EventsList"
import './App.css'
import Header from './Components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import EventDetail from './Components/EventDetail'
import StaffDashboard from './Components/StaffDashboard';
import ManualEventList from './Components/ManualEventsList';
import { useUser } from "./context/UserContext";


function App() {
  const { user } = useUser();

  return (
    <Router>
      <Header />

      <Routes>
        {user?.role === "user" ? (
          <Route path="/" element={<EventsList />} />
        ) : null}
        <Route path="/events/:id" element={<EventDetail />} />

        <Route path="/staff-events" element={<ManualEventList />} />
        <Route
          path="/"
          element={
            user?.role === "user"
              ? <EventsList />
              : user?.role === "staff"
                ? <StaffDashboard />
                : <Login />
          }
        />
        <Route path='/register' element={<Register />} />

      </Routes>
    </Router>
  )
}

export default App