import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';
import { useUser } from "../context/UserContext";
import EventCard from "../Components/EventCard.jsx";
import "../../css/EventCard.css";

const EventList = () => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useUser();

    const [keyword, setKeyword] = useState("music");
    const [city, setCity] = useState("");

    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchEvents(keyword.trim(), city.trim());
            setEvents(data);
        } catch (err) {
            setError(err);
            setEvents(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadEvents();
    };

    return (
        <div className="container my-4">
            <h2 className="mb-3">{user ? `Welcome, ${user.name ?? "User"}!` : "Not logged in"}</h2>

            <form onSubmit={handleSearch} className="row g-3 mb-4 align-items-end">
                <div className="col-md-5">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by keyword"
                        name="keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <div className="col-md-5">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filter by city"
                        name="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <button type="submit" className="btn btn-primary w-100">
                        Search
                    </button>
                </div>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p>Something went wrong: {error.message}</p>}
            {!loading && !error && (!events || events.length === 0) && (
                <p>No events found.</p>
            )}

            <div className="events-grid">
                {events?.map((event) => (
                    <EventCard key={event.id || event._id} event={event} />
                ))}
            </div>

            <button>Continue</button>
        </div>
    );
};

export default EventList;
