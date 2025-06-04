import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { fetchEventsById, signupForEvent, addEventToCalendar } from '../services/api.js';
import { useUser } from "../context/UserContext.jsx";

const EventDetail = () => {
    const { token } = useUser();
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [signupMessage, setSignupMessage] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const [calendarMessage, setCalendarMessage] = useState('');
    const [calendarLoading, setCalendarLoading] = useState(false);
    const hasHandledOAuth = useRef(false);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                const data = await fetchEventsById(id);
                setEvent(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
    }, [id]);

    useEffect(() => {
        const handleMessage = (e) => {
            if (e.origin !== "http://localhost:5000") return;

            if (e.data === 'oauth-success' && !hasHandledOAuth.current) {
                hasHandledOAuth.current = true;

                const waitForEventThenAdd = async () => {
                    let attempts = 0;
                    while (!event && attempts < 10) {
                        await new Promise((res) => setTimeout(res, 300));
                        attempts++;
                    }
                    if (event) addEvent();
                    else alert("Event still not loaded after OAuth.");
                };

                waitForEventThenAdd();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [event]);

    const getUserIdFromToken = (jwt) => {
        try {
            const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                    .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            return decoded.id || decoded._id || decoded.sub || null;
        } catch {
            return null;
        }
    };

    const saveEventToDB = async (eventObj, jwt) => {
        const cleaned = {
            ...eventObj,
            startDate: new Date(eventObj.startDate).toISOString(),
            endDate: new Date(eventObj.endDate).toISOString(),
        };
        const res = await axios.post("http://localhost:5000/api/events", cleaned, {
            headers: {
                Authorization: `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });
        return res.data;
    };

    const addEvent = async () => {
        if (!event) return alert("Event data missing.");
        const jwt = localStorage.getItem("token");
        const userId = getUserIdFromToken(jwt);
        if (!userId) return alert("You must be logged in.");

        try {
            const start = event.startDate || event.dates?.start?.dateTime;
            const end = event.endDate || (start ? new Date(new Date(start).getTime() + 3600000) : null);

            const eventToSave = {
                externalId: event.externalId || event.id || `ext-${Date.now()}`,
                title: event.title || event.name || "Untitled Event",
                description: event.description || "",
                startDate: start,
                endDate: end,
                location: {
                    venue: event.venue || event._embedded?.venues?.[0]?.name || "",
                    city: event.city || event._embedded?.venues?.[0]?.city?.name || "",
                },
                image: event.image || event.images?.[0]?.url || "",
                createdBy: userId,
                url: event.url || "",
                attendees: [],
            };

            const saved = await saveEventToDB(eventToSave, jwt);
            await addEventToCalendar(saved._id, jwt);
            alert("Event added to calendar!");
        } catch (err) {
            console.error(err);
            alert("Failed to add to calendar.");
        }
    };

    const handleSignUp = async () => {
        if (!token) return setSignupMessage("Log in to sign up.");

        setSignupLoading(true);
        setSignupMessage("");
        try {
            const res = await signupForEvent(id, token);
            setSignupMessage(res.message || "Signed up successfully!");
        } catch (err) {
            console.error(err);
            setSignupMessage(err.response?.data?.error || "Signup failed.");
        } finally {
            setSignupLoading(false);
        }
    };

    const handleAddToCalendar = async () => {
        if (!token) return setCalendarMessage("Log in to use calendar.");

        setCalendarLoading(true);
        setCalendarMessage("");
        try {
            const { data } = await axios.get("http://localhost:5000/api/calendar/oauth", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            const oauthUrl = data.url;
            if (!oauthUrl) throw new Error("OAuth URL missing.");

            const width = 500, height = 600;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;

            window.open(
                oauthUrl,
                "GoogleOAuth",
                `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
            );
        } catch (err) {
            console.error(err);
            setCalendarMessage("OAuth failed.");
        } finally {
            setCalendarLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div className="card shadow-lg p-4 rounded-2xl max-w-xl mx-auto">
            <div className="w-full h-64 overflow-hidden rounded-xl mb-4">
                <img
                    src={event.images?.[4]?.url || event.images?.[0]?.url || event.image || ""}
                    alt={event.name || event.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="space-y-3">
                <h2 className="text-2xl font-bold">{event.name || event.title}</h2>
                {event.classifications?.[0]?.genre?.name && (
                    <p className="text-gray-600"><strong>Genre:</strong> {event.classifications[0].genre.name}</p>
                )}
                {event.dates?.start?.localDate && (
                    <p className="text-gray-600"><strong>Date:</strong> {event.dates.start.localDate} at {event.dates.start.localTime}</p>
                )}
                {event.description && (
                    <p><strong>Description:</strong><br />
                        {event.description.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                    </p>
                )}
                {event.url && (
                    <p><strong>More Info:</strong> <a href={event.url} target="_blank" rel="noopener noreferrer">{event.url}</a></p>
                )}

                <div className="mt-3 flex gap-2 flex-wrap">
                    {token ? (
                        <>
                            <button className="btn btn-primary" onClick={handleSignUp} disabled={signupLoading}>
                                {signupLoading ? "Signing up…" : "Sign Up"}
                            </button>
                            <button className="btn btn-success" onClick={handleAddToCalendar} disabled={calendarLoading}>
                                {calendarLoading ? "Connecting…" : "Add to Calendar"}
                            </button>
                        </>
                    ) : (
                        <p className="text-red-500">You must log in to sign up or add to calendar.</p>
                    )}
                </div>

                {signupMessage && <p className="text-green-600 mt-2">{signupMessage}</p>}
                {calendarMessage && <p className="text-blue-500 mt-2">{calendarMessage}</p>}
            </div>
        </div>
    );
};

export default EventDetail;

