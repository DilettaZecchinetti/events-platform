import React from "react";

function StaffEventManagement({
    formData,
    setFormData,
    eventIdToEdit,
    setEventIdToEdit,
    handleCreate,
    handleUpdate,
    resetForm,
}) {
    return (
        <div className="container py-5">
            <h2 className="mb-5 text-center fw-bold">Staff Event Management</h2>
            <div className="mb-5 p-4 bg-white rounded shadow-sm border">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        eventIdToEdit ? handleUpdate() : handleCreate();
                    }}
                    noValidate
                >
                    {/* Your existing form inputs here */}
                    {/* Title input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            autoComplete="off"
                            required
                            aria-label="Event Title"
                        />
                    </div>

                    {/* Description textarea */}
                    <div className="mb-4">
                        <textarea
                            className="form-control form-control-lg"
                            placeholder="Description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            aria-label="Event Description"
                        />
                    </div>

                    {/* Location input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            autoComplete="off"
                            required
                            aria-label="Event Location"
                        />
                    </div>

                    {/* Start and End date/time */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <label htmlFor="startDateTime" className="form-label fw-semibold">
                                Start Date & Time
                            </label>
                            <input
                                id="startDateTime"
                                type="datetime-local"
                                className="form-control form-control-lg"
                                value={formData.startDateTime}
                                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                                required
                                aria-describedby="startDateTimeHelp"
                            />
                            <div id="startDateTimeHelp" className="form-text">
                                When the event starts
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="endDateTime" className="form-label fw-semibold">
                                End Date & Time
                            </label>
                            <input
                                id="endDateTime"
                                type="datetime-local"
                                className="form-control form-control-lg"
                                value={formData.endDateTime}
                                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                                required
                                aria-describedby="endDateTimeHelp"
                            />
                            <div id="endDateTimeHelp" className="form-text">
                                When the event ends
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-3">
                        <button type="submit" className="btn btn-primary btn-lg flex-grow-1 shadow-sm">
                            {eventIdToEdit ? "Update Event" : "Create Event"}
                        </button>

                        {eventIdToEdit && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-lg flex-grow-1"
                                onClick={() => {
                                    resetForm();
                                    setEventIdToEdit(null);
                                }}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StaffEventManagement;