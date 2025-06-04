import React from 'react';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import "../../css/EventCard.css";

function EventCard({ event }) {
    const venue = event._embedded?.venues?.[0];

    return (
        <Card bg="light" text="dark" className="mb-4 shadow-sm h-100">
            <div style={{ height: "200px", overflow: "hidden" }}>
                <Card.Img
                    variant="top"
                    src={event.images?.[1]?.url || event.images?.[0]?.url || ""}
                    alt={`Image for ${event.name}`}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
            </div>
            <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                    <Card.Title className="fw-bold">{event.name}</Card.Title>
                    <Card.Text className="text-muted">
                        {new Date(event.dates.start.dateTime)
                            .toLocaleString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Europe/London",
                            })
                            .replace("am", "AM")
                            .replace("pm", "PM")}
                    </Card.Text>
                    <Card.Text className="text-secondary">
                        {venue?.name}, {venue?.city?.name}
                    </Card.Text>
                </div>
                <div className="mt-3">
                    <Link to={`/events/${event.id}`}>
                        <Button variant="primary" className="w-100">
                            Read More
                        </Button>
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
}

export default EventCard;
