import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';

// Get all events
// Get all events
export async function GET(req) {
    try {
        await dbConnect();
        const events = await Event.find({});
        // Map over events to include the _id as id for FullCalendar
        const formattedEvents = events.map(event => ({
            id: event._id.toString(), // Ensure _id is passed as id
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            description: event.description,
            location: event.location,
            category: event.category,
            priority: event.priority,
        }));
        return new Response(JSON.stringify(formattedEvents), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}


// Create a new event
export async function POST(req) {
    try {
        await dbConnect();
        const { title, start, end, allDay, description, location, category, priority } = await req.json();

        const newEvent = new Event({
            title,
            start,
            end,
            allDay,
            description,
            location,
            category,
            priority,
        });

        await newEvent.save();
        return new Response(JSON.stringify(newEvent), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// Delete an event by ID
export async function DELETE(req) {
    try {
        await dbConnect();
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        console.log("here");
        
        if (!id) {
            return new Response(JSON.stringify({ error: 'Event ID is required' }), { status: 400 });
        }

        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'Event deleted successfully' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}


// Your PATCH method in the API route
export async function PATCH(req) {
    console.log('Request URL:', req.url);  // Log the full request URL to check if the id is included

    try {
        await dbConnect();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get('id');  // Get 'id' from the query string

        if (!id) {
            return new Response(JSON.stringify({ error: 'Event ID is required' }), { status: 400 });
        }

        const updates = await req.json();
        const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedEvent) {
            return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(updatedEvent), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

