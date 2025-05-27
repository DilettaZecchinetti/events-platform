import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventsById, signupForEvent } from '../services/api.js';
import { useUser } from "../context/UserContext.jsx";


const EventDetail = () => {
    const { token, user } = useUser();
    const [event, setEvent] = useState(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [signupMessage, setSignupMessage] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchEventsById(id)
            .then((data) => {
                setEvent(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err);
                setLoading(false);
            });
    }, [id]);

    const handleSignUp = async () => {
        if (!token) {
            setSignupMessage('You need to log in to sign up for this event.');
            return;
        }

        setSignupLoading(true);
        setSignupMessage('');
        try {
            const result = await signupForEvent(id, token);
            setSignupMessage(result.message || 'Successfully signed up for the event!');
        } catch (err) {
            console.error("Signup failed:", err);
            setSignupMessage(err.response?.data?.error || 'Failed to sign up. Please try again.');
        }
        setSignupLoading(false);
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
                <button onClick={handleSignUp} disabled={signupLoading}>
                    {signupLoading ? 'Signing up...' : 'Sign Up'}
                </button>
            )}

            {signupMessage && <p>{signupMessage}</p>}
        </div>
    );
};


export default EventDetail;

