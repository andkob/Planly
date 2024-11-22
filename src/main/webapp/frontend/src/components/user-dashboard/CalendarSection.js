import React from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './css/calendarStyles.css';

export default function CalendarSection() {
    const localizer = momentLocalizer(moment);

    // TODO - Sample events for display
    const myEventsList = [
        {
            title: "Camping Trip",
            start: new Date(2024, 10, 15, 10, 0), // Oct 15, 2024, 10:00 AM
            end: new Date(2024, 10, 15, 14, 0),   // Oct 15, 2024, 2:00 PM
        },
        {
            title: "Chapter Meeting",
            start: new Date(2024, 10, 19, 17, 0), // Oct 19, 2024, 5:00 PM
            end: new Date(2024, 10, 19, 18, 0),   // Oct 19, 2024, 6:00 PM
        },
        {
            title: "Food Pantry",
            start: new Date(2024, 10, 24, 9, 0), // Oct 24, 2024, 9:00 AM
            end: new Date(2024, 10, 24, 12, 0),  // Oct 24, 2024, 12:00 PM
        }
    ];

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Organization Calendar</h3>
            <Calendar
                localizer={localizer}
                events={myEventsList}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        </div>
    );
}