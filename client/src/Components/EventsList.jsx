import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';
import EventCard from "../Components/EventCard.jsx"
import "../../css/EventCard.css";


const EventList = () => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    if (!events) return <p>No events found.</p>;

    return (
        <div>

            <div className="events-grid">
                {events.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
            <button>Continue</button>
        </div >
    );
};

export default EventList;
