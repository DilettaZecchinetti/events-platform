import { useEffect, useState } from "react";
import { fetchEvents } from "../services/api";
import { useUser } from "../context/UserContext";
import EventCard from "../Components/EventCard.jsx";
import "../../css/EventsList.css";

const EventList = () => {
    const [events, setEvents] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useUser();

    const [query, setQuery] = useState("");

    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchEvents({ keyword: query, page });
            setEvents(data.events);
            setTotalPages(data.page.totalPages);
        } catch (err) {
            setError(err);
            setEvents(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        loadEvents();
    };

    return (


        <div className="container my-4" style={{ maxWidth: "1500px" }}>

            <div className="container my-5" style={{ maxWidth: "1500px" }}>
                <div
                    className="banner-container"
                    style={{
                        background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                        color: "#fff",
                        borderRadius: "15px",
                        padding: "50px 20px",
                        textAlign: "center",
                        boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div className="banner-content">
                        <h1
                            className="banner-tagline"
                            style={{
                                fontSize: "2.5rem",
                                fontWeight: "900",
                                marginBottom: "15px",
                                lineHeight: "1.2",
                            }}
                        >
                            Explore. Sign Up. Celebrate.
                        </h1>
                        <p
                            className="banner-subtext"
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: "500",
                                maxWidth: "700px",
                                margin: "0 auto",
                            }}
                        >
                            Find amazing events near you and join the fun!
                        </p>
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            top: "-40px",
                            right: "-40px",
                            width: "150px",
                            height: "150px",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            borderRadius: "50%",
                        }}
                    ></div>
                    <div
                        style={{
                            position: "absolute",
                            bottom: "-50px",
                            left: "-50px",
                            width: "200px",
                            height: "200px",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            borderRadius: "50%",
                        }}
                    ></div>
                </div>
            </div>

            <form onSubmit={handleSearch} className="mb-4" style={{ padding: 0, paddingTop: 0 }}>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search for events (artist, genre, city...)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        <i className="bi bi-search"></i>
                    </button>
                </div>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p>Something went wrong: {error.message}</p>}
            {!loading && !error && (!events || events.length === 0) && (
                <p>No events found.</p>
            )}

            <div className="events-grid">
                {events?.map((event) => (
                    <EventCard key={event.id || event._id} event={event} />
                ))}
            </div>
            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-4">
                    <button
                        className="btn btn-outline-primary me-2"
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                    >
                        Previous
                    </button>

                    <span className="mx-2">
                        Page {page + 1} of {totalPages}
                    </span>

                    <button
                        className="btn btn-outline-primary ms-2"
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default EventList;


