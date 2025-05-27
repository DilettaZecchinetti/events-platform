import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventsById, signUpForEvent } from '../services/api';
import { Button } from 'react-bootstrap';
import { useUser } from "../context/UserContext.jsx";

const EventDetail = () => {
    const { token } = useUser();

    const [event, setEvent] = useState([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [signupMessage, setSignupMessage] = useState('');



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

    const handleSignUp = async () => {
        try {
            const result = await signUpForEvent('Diletta', 'diletta@example.com', id);
            setSignupMessage('Successfully signed up for the event!');
        } catch (err) {
            setSignupMessage('Failed to sign up. Please try again.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Something went wrong: {error.message}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div>
            <h2>{event.name}</h2>
            {!token ? (
                <p>You need to log in to sign up for this event.</p>
            ) : (
                <button onClick={handleSignUp}>Sign Up</button>
            )}

            {signupMessage && <p>{signupMessage}</p>}
        </div>
    );

};

export default EventDetail;
