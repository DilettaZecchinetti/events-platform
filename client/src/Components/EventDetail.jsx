import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventsById } from '../services/api';

const EventDetail = () => {
    const [event, setEvent] = useState([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEventsById(id)
            .then((data) => {
                setEvent(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false)
            });
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Something went wrong: {error.message}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div>{event.name}</div>)
        ;
};

export default EventDetail;
