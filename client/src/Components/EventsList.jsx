import { useEffect, useState } from "react";
import { fetchEvents } from "../services/api";
import { useUser } from "../context/UserContext";
import EventCard from "../Components/EventCard.jsx";
import "../../css/EventsList.css";

const EventList = () => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useUser();

    const [query, setQuery] = useState(""); // 

    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchEvents({ query });
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
        <div className="container my-4" style={{ maxWidth: "1500px" }}>
            {/* <h2 className="mb-3 mt-5">
                {user ? `Welcome back, ${user.name ?? "User"}!` : "Not logged in"}
            </h2> */}

            <form onSubmit={handleSearch} className="mb-4" style={{ padding: 0, paddingTop: 0 }}>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search for events (artist, genre, city...)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        <i className="bi bi-search"></i>
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
        </div>
    );
};

export default EventList;


