import React from "react";
import Image from "next/image";

class EventForm extends React.Component {
  constructor(props) {
    super(props);
    const startTime = new Date(this.props.eventData.StartTime);
    const endTime = new Date(this.props.eventData.EndTime);
    this.state = {
      eventName: this.props.eventData.EventName,
      eventOrganizer: this.props.dept,
      venue: this.props.eventData.EventVenue,
      startTime: startTime.toLocaleString(),
      endTime: endTime.toLocaleString(),
      eventPoster: this.props.eventData.fileUrl.poster,
      eventPhotos: "",
      eventObjective: this.props.eventData.EventObjective,
      eventLocation: this.props.eventData.eventLocation,
      budget: this.props.eventData.Budget,
      coordinator: this.props.eventData.eventCoordinators[0],
      resourcePerson: this.props.eventData.eventResourcePerson[0],
    };
  }

  render() {
    return (
      <div className="flex justify-center">
        <div className="bg-white px-2 py-8 rounded-lg border-2 border-black w-2/3 justify-center">
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Event Title:</span>
              <input
                type="text"
                value={this.state.eventName}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>
            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Event Organized by:</span>
              <input
                type="text"
                value={this.state.eventOrganizer}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Venue:</span>
              <input
                type="text"
                value={this.state.venue}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Start Time:</span>
              <input
                type="text"
                value={this.state.startTime}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>End Time:</span>
              <input
                type="text"
                value={this.state.endTime}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Event Objective:</span>
              <textarea
                value={this.state.eventObjective}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Event Location:</span>
              <input
                type="text"
                value={this.state.eventLocation}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Budget:</span>
              <input
                type="text"
                value={this.state.budget}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Coordinator:</span>
              <input
                type="text"
                value={`${this.state.coordinator.coordinatorName}, ${this.state.coordinator.coordinatorRole}`}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Resource Person:</span>
              <input
                type="text"
                value={`${this.state.resourcePerson.ResourcePersonName}, ${this.state.resourcePerson.ResourcePersonDesgn}`}
                readOnly
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  outline: "1px solid black",
                }}
              />
            </label>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <span style={{ fontWeight: "bold" }}>Event Poster:</span>
              <img
                src={this.state.eventPoster}
                alt="Event Poster"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </label>

            {this.state.eventPhotos !== "" && (
              <label
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <span style={{ fontWeight: "bold" }}>Event Photos:</span>
                <img
                  src={this.state.eventPhotos}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </label>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default EventForm;
