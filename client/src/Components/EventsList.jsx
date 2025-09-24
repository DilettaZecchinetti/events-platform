import { useEffect, useState } from "react";
import { fetchEvents } from "../services/api";
import { useUser } from "../context/UserContext";
import EventCard from "../Components/EventCard.jsx";
import "../../css/EventsList.css";
import DateRangePicker from "./DateRangePicker";

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const loadEvents = async (pageNumber = 0) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchEvents({
                keyword: keyword || undefined,
                location: location || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                page: pageNumber,
            });

            setEvents(data.events || []);
            setTotalPages(data.page?.totalPages || 1);
        } catch (err) {
            setError(err.message || "Error fetching events");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents(page);
    }, [page, keyword, location, startDate, endDate]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        loadEvents(0);
    };

    const formatDisplayDate = (date, isStart = true) => {
        if (!date) return "";
        const [year, month, day] = date.split("-");
        const d = new Date(Date.UTC(year, month - 1, day));
        if (isStart) d.setUTCHours(0, 0, 0, 0);
        else d.setUTCHours(23, 59, 59, 999);

        const dd = String(d.getUTCDate()).padStart(2, "0");
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const yyyy = d.getUTCFullYear();
        return `${dd}-${mm}-${yyyy}`;
    };


    const clearFilter = (filter) => {
        switch (filter) {
            case "location":
                setLocation("");
                break;
            case "startDate":
                setStartDate("");
                break;
            case "endDate":
                setEndDate("");
                break;
            case "keyword":
                setKeyword("");
                break;
        }
        setPage(0);
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
                        padding: "30px 20px",
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
                                fontSize: "2rem",
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

            <form
                onSubmit={handleSearch}
                className="p-4 bg-white shadow-lg rounded-5 mb-4"
                style={{ maxWidth: "1200px", margin: "0 auto" }}
            >
                <div className="row g-3 align-items-center">

                    <div className="col-md-3">
                        <select
                            className="form-select rounded-4 shadow-sm border-0 py-2 px-3"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            style={{ fontSize: "0.95rem" }}
                        >
                            <option value="">All of United Kingdom</option>
                            <option value="London">London</option>
                            <option value="South">South</option>
                            <option value="Midlands & Central">Midlands & Central</option>
                            <option value="Wales & North West">Wales & North West</option>
                            <option value="North & North East">North & North East</option>
                            <option value="Scotland">Scotland</option>
                            <option value="Northern Ireland">Northern Ireland</option>
                        </select>
                    </div>

                    <div className="col-md-4 position-relative">
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </div>

                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control rounded-4 shadow-sm border-0 py-2 px-3"
                            placeholder="Artist, Genre, Event..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            style={{ fontSize: "0.95rem" }}
                        />
                    </div>

                    <div className="col-md-1 d-grid">
                        <button
                            type="submit"
                            className="btn btn-primary rounded-4 shadow-sm"
                            style={{ padding: "0.6rem 0", fontSize: "1.1rem" }}
                        >
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                </div>
            </form>

            {(location || startDate || endDate || keyword) && (
                <div className="mb-3 d-flex flex-wrap gap-2">
                    {location && <span className="badge bg-primary" style={{ cursor: "pointer" }} onClick={() => clearFilter("location")}>Location: {location} ×</span>}
                    {startDate && <span className="badge bg-success" style={{ cursor: "pointer" }} onClick={() => clearFilter("startDate")}>From: {formatDisplayDate(startDate, true)} ×</span>}
                    {endDate && <span className="badge bg-success" style={{ cursor: "pointer" }} onClick={() => clearFilter("endDate")}>To: {formatDisplayDate(endDate, false)} ×</span>}
                    {keyword && <span className="badge bg-info" style={{ cursor: "pointer" }} onClick={() => clearFilter("keyword")}>Keyword: "{keyword}" ×</span>}
                </div>
            )}

            {loading && <p>Loading events...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && events.length === 0 && <p>No events found.</p>}

            <div className="events-grid">
                {events.map((event) => (
                    <EventCard key={event.id || event._id} event={event} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-4">
                    <button className="btn btn-outline-primary me-2" onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>Previous</button>
                    <span className="mx-2">Page {page + 1} of {totalPages}</span>
                    <button className="btn btn-outline-primary ms-2" onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} disabled={page >= totalPages - 1}>Next</button>
                </div>
            )}
        </div>
    );
};

export default EventList;


