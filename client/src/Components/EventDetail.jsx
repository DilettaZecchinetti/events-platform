import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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
    const [calendarMessage, setCalendarMessage] = useState('');
    const [calendarLoading, setCalendarLoading] = useState(false);

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

    const handleAddToCalendar = async () => {
        if (!token) {
            setCalendarMessage("Please log in to add event to your calendar.");
            return;
        }

        setCalendarLoading(true);
        setCalendarMessage("");
        try {
            const response = await axios.get("/api/calendar/oauth", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const oauthUrl = response.data.url;
            if (!oauthUrl) throw new Error("No OAuth URL received");

            const width = 500;
            const height = 600;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;

            window.open(
                oauthUrl,
                "GoogleOAuth",
                `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
            );

            setCalendarMessage(
                "A new window has opened to connect your calendar. Please complete the process there."
            );
        } catch (error) {
            console.error("Calendar OAuth failed:", error);
            setCalendarMessage("Failed to initiate calendar connection.");
        }
        setCalendarLoading(false);
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
                <>
                    <button onClick={handleSignUp} disabled={signupLoading}>
                        {signupLoading ? 'Signing up...' : 'Sign Up'}
                    </button>

                    <button onClick={handleAddToCalendar} disabled={calendarLoading} style={{ marginLeft: '1rem' }}>
                        {calendarLoading ? 'Connecting...' : 'Add to Calendar'}
                    </button>
                </>
            )}

            {signupMessage && <p>{signupMessage}</p>}
            {calendarMessage && <p>{calendarMessage}</p>}
        </div>
    );
};

export default EventDetail;
