import React from 'react';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import "../../css/EventCard.css";

function EventCard({ event }) {
    return (
        <Card bg="dark" text="white" className="event-card">
            <Card.Body className="event-card-body">
                <div className="event-card-image">
                    <Card.Img
                        variant="top"
                        src={event.images[1].url}
                        alt={`Image for ${event.name}`}
                    />
                </div>
                <div className="event-card-content">
                    <Card.Title className="event-title">{event.name}</Card.Title>
                    <Link to={`/events/${event.event_id}`}>
                        <Button variant="primary" className="read-more-btn">
                            Read More
                        </Button>
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
}

export default EventCard;
