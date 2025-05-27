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

    useEffect(() => {
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
        try {
            const result = await signupForEvent(id);

            const message = result.msg || result.message || 'Successfully signed up for the event!';
            setSignupMessage(message);
        } catch (err) {
            console.error("Signup failed:", err);
            const errorMsg =
                err.response?.data?.error ||
                err.response?.data?.msg ||
                err.message ||
                'Failed to sign up. Please try again.';

            setSignupMessage(errorMsg);
        }
    };


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Something went wrong: {error.message}</p>;
    if (!event) return <p>Event not found.</p>;

    // const isSignedUp = token && event.attendees?.includes(user?.id);

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

