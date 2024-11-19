"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    allDay: false,
    description: "",
    priority: "Low",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && document.querySelector("#__next")) {
      Modal.setAppElement("#__next"); // Ensure #__next exists
    } else {
      console.warn("Element with id #__next not found.");
    }
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get("/api/events");
        setEvents(response.data);
      } catch (error) {
        toast.error("Failed to load events.");
      }
    }
    fetchEvents();
  }, []);

  const handleDateClick = (selectInfo) => {
    setFormData({
      ...formData,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    });
    setModalIsOpen(true);
  };
  // Handle clicking on an existing event
  const handleEventClick = (clickInfo) => {
    console.log("on event click");
    const event = clickInfo.event;

    // Pre-fill form with existing event data
    setFormData({
      title: event.title,
      start: event.start.toISOString().slice(0, 16), // format for datetime-local
      end: event.end ? event.end.toISOString().slice(0, 16) : "",
      allDay: event.allDay,
      description: event.extendedProps.description || "",
      priority: event.extendedProps.priority || "Low",
      eventId: event.id, // Save event ID for editing
    });

    // Open the modal for editing
    setModalIsOpen(true);
  };
  const handleEventDrop = async (eventDropInfo) => {
    const { id } = eventDropInfo.event; // Get the event ID
    console.log("Event ID:", id); // Check if id is being printed correctly

    if (!id) {
      toast.error("Event ID is required");
      return;
    }

    const updatedEvent = {
      start: eventDropInfo.event.start.toISOString(),
      end: eventDropInfo.event.end
        ? eventDropInfo.event.end.toISOString()
        : null,
    };

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Failed to update event: ${errorData.error}`);
        eventDropInfo.revert(); // Revert the drag operation if the update fails
        return;
      }

      const updatedEventResponse = await response.json();
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? updatedEventResponse : event
        )
      );
      toast.success("Event updated successfully!");
    } catch (error) {
      toast.error("Failed to update event.");
      eventDropInfo.revert(); // Revert the drag operation on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, allDay: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/events", formData);
      setEvents([...events, response.data]);
      toast.success("Event added successfully!");
      setModalIsOpen(false);
      setFormData({
        title: "",
        start: "",
        end: "",
        allDay: false,
        description: "",
        priority: "Low",
      });
    } catch (error) {
      toast.error("Failed to add event.");
    }
  };

  return (
    <div>
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            eventClick={handleEventClick} 
            eventDrop={handleEventDrop}
            events={events}
            selectable={true}
            editable={true} // Enable drag-and-drop
          
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            height="auto"
        />

        <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            contentLabel="Edit Event"
            style={{
                content: {
                    width: '400px',
                    margin: 'auto',
                    padding: '20px',
                },
            }}
        >
            <h2>{formData.eventId ? 'Edit Event' : 'Add Event'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Event Name:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Start:</label>
                    <input
                        type="datetime-local"
                        name="start"
                        value={formData.start}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>End:</label>
                    <input
                        type="datetime-local"
                        name="end"
                        value={formData.end}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>All Day:</label>
                    <input
                        type="checkbox"
                        name="allDay"
                        checked={formData.allDay}
                        onChange={handleCheckboxChange}
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Priority:</label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <button type="submit">{formData.eventId ? 'Update Event' : 'Add Event'}</button>
                <button type="button" onClick={() => setModalIsOpen(false)}>
                    Cancel
                </button>
            </form>
        </Modal>

        <ToastContainer position="top-right" autoClose={3000} />
    </div>
);
};

export default Calendar;
