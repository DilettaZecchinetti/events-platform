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
import EventList from './Components/EventsList';
import { useUser } from "./context/UserContext";
import EventBanner from "./Components/EventBanner";

function App() {
  const { user } = useUser();

  return (
    <Router>
      <Header />
      {user?.role === "user" && <EventBanner />}
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
        <Route path='/events' element={<EventList />} />
        <Route path='/staff-dashboard' element={<StaffDashboard />} />
      </Routes>
    </Router>
  )
}

export default App