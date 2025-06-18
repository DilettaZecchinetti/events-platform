import React from "react";

function StaffCreatedEvents({ events, startEditing, handleDelete }) {
    return (
        <div className="container py-5">
            <h2 className="mb-5 text-center fw-bold">Staff Created Events</h2>

            {events.length === 0 ? (
                <p className="text-muted text-center fst-italic">No events created yet.</p>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {events.map((event) => (
                        <div key={event._id} className="col">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bold">{event.title}</h5>
                                    <p className="card-text flex-grow-1">{event.description}</p>
                                    <p className="mb-2">
                                        <span role="img" aria-label="location pin">
                                            📍
                                        </span>{" "}
                                        {event.location}
                                    </p>
                                    <small className="text-muted mb-3">
                                        {new Date(event.startDate).toLocaleString()} –{" "}
                                        {new Date(event.endDate).toLocaleString()}
                                    </small>
                                    <div className="mt-auto d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => startEditing(event)}
                                            aria-label={`Edit event titled ${event.title}`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(event._id)}
                                            aria-label={`Delete event titled ${event.title}`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StaffCreatedEvents;