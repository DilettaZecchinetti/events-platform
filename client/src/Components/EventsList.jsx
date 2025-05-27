import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';
import { useUser } from "../context/UserContext";
import EventCard from "../Components/EventCard.jsx"
import "../../css/EventCard.css";

const EventList = () => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchEvents();
                console.log("API response:", data);
                setEvents(data);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Something went wrong: {error.message}</p>;
    if (!events || events.length === 0) return <p>No events found.</p>;

    return (
        <div>
            <p>{user ? `Welcome, ${user.name ?? "User"}` : "Not logged in"}</p>
            <div className="events-grid">
                {events.map(event => (
                    <EventCard key={event.id || event._id} event={event} />
                ))}
            </div>
            <button>Continue</button>
        </div>
    );
};

export default EventList;
