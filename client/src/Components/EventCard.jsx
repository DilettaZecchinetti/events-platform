import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';

const EventCard = () => {
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
            <h1>Music Events</h1>
            <p>Total events: {events.length}</p>
            <ul>
                {events.map(event => (
                    <li key={event.id} event={event}>
                        {event.name}
                    </li>
                ))}
            </ul>
            <button>Continue</button>
        </div >
    );
};

export default EventCard;
