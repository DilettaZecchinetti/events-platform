import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext.jsx";
import { signupForEvent } from "../services/api.js";

const ManualEventList = () => {
    const { token } = useUser();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupMessage, setSignupMessage] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/events/manual", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(res.data);
            } catch (err) {
                console.error("Error fetching manual events:", err);
            }
        };

        fetchEvents();
    }, [token]);

    const handleSignUp = async (eventId) => {
        if (!token) {
            setSignupMessage('You need to log in to sign up for this event.');
            return;
        }

        setSignupLoading(true);
        setSignupMessage('');

        try {
            const result = await signupForEvent(eventId, token);
            setSignupMessage(result.message || 'Successfully signed up for the event!');
        } catch (err) {
            console.error("Signup failed:", err);
            setSignupMessage(err.response?.data?.error || 'Failed to sign up. Please try again.');
        } finally {
            setSignupLoading(false);
        }
    };

    const handleAddToCalendar = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/calendar/oauth", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            const oauthUrl = res.data.url;
            window.open(oauthUrl, "_blank", "width=500,height=600");
            alert("Please complete the calendar connection.");
        } catch (err) {
            console.error("Error initiating OAuth:", err);
            alert("Failed to initiate calendar connection.");
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Manual Events</h2>
            {signupMessage && <p className="text-success mt-3">{signupMessage}</p>}

            {events.length === 0 ? (
                <p>No manual events available.</p>
            ) : (
                <ul className="space-y-4">
                    {events.map((event) => (
                        <li key={event._id} className="border p-4 rounded-xl shadow">
                            <h3 className="text-lg font-medium">{event.title}</h3>
                            <p className="mt-2">{event.description}</p>
                            <p className="text-sm text-gray-600">
                                {new Date(event.startDate).toLocaleString()} –{" "}
                                {new Date(event.endDate).toLocaleString()}
                            </p>

                            <div className="mt-4 flex gap-2">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                    onClick={() => handleSignUp(event._id)}
                                    disabled={signupLoading}
                                >
                                    {signupLoading ? "Signing up..." : "Sign Up"}
                                </button>

                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                                    onClick={handleAddToCalendar}
                                >
                                    Add to Calendar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManualEventList;
