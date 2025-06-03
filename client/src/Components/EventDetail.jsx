import * as jwtDecode from "jwt-decode";
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { fetchEventsById, signupForEvent, addEventToCalendar } from '../services/api.js';
import { useUser } from "../context/UserContext.jsx";

const EventDetail = () => {
    const { token } = useUser();
    const [event, setEvent] = useState(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [signupMessage, setSignupMessage] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const [calendarMessage, setCalendarMessage] = useState('');
    const [calendarLoading, setCalendarLoading] = useState(false);

    const hasHandledOAuth = useRef(false);

    useEffect(() => {
        setLoading(true);
        fetchEventsById(id)
            .then((data) => {
                console.log("Fetched event:", data);
                setEvent(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        function handleMessage(eventMessage) {
            if (eventMessage.origin !== "http://localhost:5000") return;

            if (eventMessage.data === 'oauth-success' && !hasHandledOAuth.current) {
                console.log("OAuth success received. Adding event to calendar...");
                hasHandledOAuth.current = true;

                const waitForEvent = async () => {
                    let attempts = 0;
                    while (!event && attempts < 10) {
                        console.log("Waiting for event to be loaded...");
                        await new Promise((res) => setTimeout(res, 300));
                        attempts++;
                    }
                    if (event) {
                        addEvent();
                    } else {
                        alert("Event data still not available after OAuth.");
                    }
                };

                waitForEvent();
            }
        }

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [event]);

    const getUserIdFromToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                    .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            return decoded.id || decoded._id || decoded.userId || decoded.sub || null;
        } catch (e) {
            console.error('Error decoding token manually', e);
            return null;
        }
    };

    const saveEventToDB = async (eventObj, token) => {
        const sanitizedEvent = {
            ...eventObj,
            startDate: new Date(eventObj.startDate).toISOString(),
            endDate: new Date(eventObj.endDate).toISOString(),
        };

        const response = await axios.post(
            "http://localhost:5000/api/events",
            sanitizedEvent,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }
        );

        return response.data;
    };

    const addEvent = async () => {
        if (!event) {
            console.log("No event data available.");
            alert("No event data available.");
            return;
        }

        try {
            const tokenFromStorage = localStorage.getItem("token");
            const userId = getUserIdFromToken(tokenFromStorage);

            if (!userId) {
                alert("User not authenticated properly.");
                return;
            }

            const eventToSave = {
                externalId: event.id || event.externalId || `ext-${Date.now()}`,
                title: event.name || event.title || "Untitled Event",
                description: event.description || "",
                startDate: event.startDate
                    ? new Date(event.startDate)
                    : event.dates?.start?.dateTime
                        ? new Date(event.dates.start.dateTime)
                        : new Date(),
                endDate: event.endDate
                    ? new Date(event.endDate)
                    : event.dates?.start?.dateTime
                        ? new Date(new Date(event.dates.start.dateTime).getTime() + 60 * 60 * 1000)
                        : new Date(Date.now() + 60 * 60 * 1000),
                location: {
                    venue: event.venue || event._embedded?.venues?.[0]?.name || "",
                    city: event.city || event._embedded?.venues?.[0]?.city?.name || "",
                },
                image: event.image || event.images?.[0]?.url || "",
                createdBy: userId,
                url: event.url || "",
                attendees: [],
            };

            const savedEvent = await saveEventToDB(eventToSave, tokenFromStorage);
            await addEventToCalendar(savedEvent._id, tokenFromStorage);

            alert("Event added to calendar!");
        } catch (err) {
            console.error("Add event failed:", err);
            alert("Failed to add event to calendar.");
        }
    };

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
        } finally {
            setSignupLoading(false);
        }
    };

    const handleAddToCalendar = async () => {
        if (!token) {
            setCalendarMessage("Please log in to add event to your calendar.");
            return;
        }

        setCalendarLoading(true);
        setCalendarMessage("");

        try {
            const oauthResponse = await axios.get("http://localhost:5000/api/calendar/oauth", {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });

            const oauthUrl = oauthResponse.data.url;
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

        } catch (error) {
            console.error("Calendar add failed:", error);
            setCalendarMessage("Failed to add event to calendar.");
        } finally {
            setCalendarLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Something went wrong: {error.message}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div className="card shadow-lg p-4 rounded-2xl max-w-xl mx-auto">
            <div className="w-full h-64 overflow-hidden rounded-xl mb-4">
                <img
                    src={event.images?.[4]?.url || event.images?.[0]?.url || ""}
                    alt={event.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="card-body space-y-3">
                <h2 className="text-2xl font-bold">{event.name}</h2>

                {event.classifications?.[0]?.genre?.name && (
                    <p className="text-sm text-gray-600">
                        <strong>Genre:</strong> {event.classifications[0].genre.name}
                    </p>
                )}

                {event.dates?.start?.localDate && (
                    <p className="text-sm text-gray-600">
                        <strong>Date:</strong> {event.dates.start.localDate} at {event.dates.start.localTime}
                    </p>
                )}

                {event.description && (
                    <p className="text-base">
                        <strong>Description:</strong><br />
                        {event.description.split('\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </p>
                )}
                {event.url && (
                    <p className="card-text">
                        <strong>More Info:</strong>{' '}
                        <a href={event.url} target="_blank" rel="noopener noreferrer">
                            {event.url}
                        </a>
                    </p>
                )}

                <div className="mt-3">
                    {!token ? (
                        <p className="text-danger">You need to log in to sign up for this event.</p>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={handleSignUp}
                                disabled={signupLoading}
                            >
                                {signupLoading ? 'Signing up…' : 'Sign Up'}
                            </button>

                            <button
                                className="btn btn-success"
                                onClick={handleAddToCalendar}
                                disabled={calendarLoading}
                            >
                                {calendarLoading ? 'Connecting…' : 'Add to Calendar'}
                            </button>
                        </div>
                    )}
                </div>

                {signupMessage && <p className="text-success mt-3">{signupMessage}</p>}
                {calendarMessage && <p className="text-info mt-2">{calendarMessage}</p>}
            </div>
        </div>
    );
};

export default EventDetail;
