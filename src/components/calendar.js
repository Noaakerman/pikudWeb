"use client";

import { useEffect, useState } from "react";
import "./calendar.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Preloader from "./Preloader.tsx";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    allDay: false,
    description: "",
    priority: "Low",
    eventId: null,
  });

  useEffect(() => {
    console.log("useEffect is in");
    // Make sure #__next exists before setting it as the app element
    if (document.getElementById('__next')) {
      Modal.setAppElement('#__next');
    }
  }, []);
  

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get("/api/events");
        setEvents(response.data);
      } catch (error) {
        toast.error("Failed to load events.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleDateClick = (selectInfo) => {
    console.log('Date clicked:', selectInfo);
    setFormData({
      ...formData,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    });
    setModalIsOpen(true);
  };
  


  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setFormData({
      title: event.title,
      start: event.start.toISOString().slice(0, 16),
      end: event.end ? event.end.toISOString().slice(0, 16) : "",
      allDay: event.allDay,
      description: event.extendedProps.description || "",
      priority: event.extendedProps.priority || "Low",
      eventId: event.id,
    });
    setModalIsOpen(true);
  };

  const handleEventDrop = async (eventDropInfo) => {
    const { id } = eventDropInfo.event;
    if (!id) {
      toast.error("Event ID is required");
      eventDropInfo.revert();
      return;
    }
    try {
      const updatedEvent = {
        start: eventDropInfo.event.start.toISOString(),
        end: eventDropInfo.event.end ? eventDropInfo.event.end.toISOString() : null,
      };
      const response = await axios.patch(`/api/events/${id}`, updatedEvent);
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? response.data : event))
      );
      toast.success("Event updated successfully!");
    } catch (error) {
      toast.error("Failed to update event.");
      eventDropInfo.revert();
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
      if (formData.eventId) {
        const response = await axios.patch(`/api/events/${formData.eventId}`, formData);
        setEvents((prev) =>
          prev.map((event) => (event.id === formData.eventId ? response.data : event))
        );
        toast.success("Event updated successfully!");
      } else {
        const response = await axios.post("/api/events", formData);
        setEvents([...events, response.data]);
        toast.success("Event added successfully!");
      }
      resetFormData();
      setModalIsOpen(false);
    } catch (error) {
      toast.error("Failed to save event.");
    }
  };
  const resetFormData = () => {
    setFormData({
      title: "",
      start: "",
      end: "",
      allDay: false,
      description: "",
      priority: "Low",
      eventId: null,
    });
  };

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <div>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            events={events}
            selectable={true}
            editable={true}
            dateClick={handleDateClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="auto"
          />

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => {
              setModalIsOpen(false);
              resetFormData();
            }}
            contentLabel="Edit Event"
            style={{
              content: {
                width: "400px",
                margin: "auto",
                padding: "20px",
              },
            }}
          >
            <h2>{formData.eventId ? "Edit Event" : "Add Event"}</h2>
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
              <button type="submit">
                {formData.eventId ? "Update Event" : "Add Event"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalIsOpen(false);
                  resetFormData();
                }}
              >
                Cancel
              </button>
            </form>
          </Modal>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      )}
    </>
  );
};

export default Calendar;
