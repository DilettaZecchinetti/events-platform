import { useEffect, useState } from "react";
import { fetchEvents } from "../services/api";
import { useUser } from "../context/UserContext";
import EventCard from "../Components/EventCard.jsx";
import "../../css/EventsList.css";

const GENRES = [
    { id: "KnvZfZ7vAv1", name: "R&B" },
    { id: "KnvZfZ7vAeA", name: "Rock" },
    { id: "KnvZfZ7vAvF", name: "Pop" },
    { id: "KnvZfZ7vAv6", name: "Hip-Hop" },
    { id: "KnvZfZ7vAvE", name: "Jazz" },
];

const CITIES = [
    "London",
    "Manchester",
    "Birmingham",
    "Glasgow",
    "Liverpool",
    "Leeds",
];

const EventList = () => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useUser();

    const [genreId, setGenreId] = useState(GENRES[0].id);
    const [city, setCity] = useState(CITIES[0]);

    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchEvents({ genreId, city });
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
            <h2 className="mb-3 mt-5">
                {user ? `Welcome back, ${user.name ?? "User"}!` : "Not logged in"}
            </h2>

            <form
                onSubmit={handleSearch}
                className="event-search-form mb-4"

                style={{
                    boxShadow: "none",
                    borderRadius: 0,
                    background: "none",
                    width: "100%",
                }}
            >
                <div className="col-md-5">
                    <select
                        className="form-select"
                        value={genreId}
                        onChange={(e) => setGenreId(e.target.value)}
                    >
                        {GENRES.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-5">
                    <select
                        className="form-select"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        {CITIES.map((cityName) => (
                            <option key={cityName} value={cityName}>
                                {cityName}
                            </option>
                        ))}
                    </select>
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
        </div>
    );
};

export default EventList;


