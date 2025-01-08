import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Calendar as CalendarIcon, Plus, X, Clock, MapPin } from 'lucide-react';
import { fetchOrganizationEvents } from '../../util/EndpointManager';

const OrgCalendar = ({ selectedOrgId, openAddEventModal, ownedOrgs, isNewEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewType, setViewType] = useState('month');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filteredEventTypes, setFilteredEventTypes] = useState([]);

  // Fetch events from the API
  const fetchEvents = async () => {
    if (selectedOrgId === -1 || selectedOrgId === undefined) return;

    const data = await fetchOrganizationEvents(selectedOrgId);
    if (data.content.length <= 0) return;
    
    const formattedEvents = data.content.map(event => ({
      ...event,
      start: new Date(event.date + 'T' + event.startTime),
      end: new Date(event.date + 'T' + event.endTime), // Add duration when available
      color: getEventColor(event.type)
    }));
    
    setEvents(formattedEvents);
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedOrgId, isNewEvents]);

  const EVENT_TYPES = {
    BROTHERHOOD: { label: 'Brotherhood', color: 'bg-green-100 text-green-800' },
    MANDATORY: { label: 'Mandatory', color: 'bg-red-300 text-red-800' },
    SOCIAL: { label: 'Social', color: 'bg-blue-100 text-blue-800' },
    PHILANTHROPY: { label: 'Philanthropy', color: 'bg-purple-300 text-purple-800' },
    OTHER: { label: 'Other', color: 'bg-gray-300 text-gray-800' },
    MEETING: { label: 'Meeting', color: 'bg-yellow-100 text-yellow-800' },
    DEADLINE: { label: 'Deadline', color: 'bg-red-300 text-red-800' }
  };

  const getEventColor = (type) => {
    return EVENT_TYPES[type]?.color || EVENT_TYPES.OTHER.color;
  };

  const FilterChip = ({ type, isSelected, onToggle }) => (
    <button
      onClick={onToggle}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
        ${isSelected ? EVENT_TYPES[type].color : 'bg-gray-000 text-gray-600'}`}
    >
      {EVENT_TYPES[type].label}
    </button>
  );

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysArray = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startDay = startDayOfMonth(currentDate);
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDate = (day) => {
    if (!day) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.start);
      const dateMatches = eventDate.getDate() === day && 
                         eventDate.getMonth() === currentDate.getMonth() &&
                         eventDate.getFullYear() === currentDate.getFullYear();
      
      // Only show events whose types are not in filteredEventTypes
      const typeIsVisible = !filteredEventTypes.includes(event.type);
      
      return dateMatches && typeIsVisible;
    });
  };

  const formatMonth = () => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + increment)));
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const isOrgOwned = ownedOrgs.some(org => org.id === selectedOrgId);

  // Render week view
  const WeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="grid grid-cols-7 gap-px h-96">
        {days.map((day, i) => (
          <div key={i} className="border p-2">
            <div className="text-sm font-medium mb-2">
              {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
            </div>
            <div className="space-y-1">
              {getEventsForDate(day.getDate()).map((event, idx) => (
                <div
                  key={idx}
                  onClick={() => handleEventClick(event)}
                  className={`${event.color} p-1 rounded text-xs cursor-pointer`}
                >
                  {event.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render day view
  const DayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDate(currentDate.getDate());

    return (
      <div className="h-96 overflow-y-auto">
        {hours.map(hour => (
          <div key={hour} className="flex border-b min-h-12">
            <div className="w-16 p-2 text-sm text-gray-500">
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className="flex-1 border-l p-1">
              {dayEvents
                .filter(event => new Date(event.start).getHours() === hour)
                .map((event, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleEventClick(event)}
                    className={`${event.color} p-1 rounded text-sm cursor-pointer mb-1`}
                  >
                    {event.name}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const EventModal = ({ event, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{event.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.start).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{new Date(event.start).toLocaleTimeString()}</span>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${EVENT_TYPES[event.type].color}`}>
            {EVENT_TYPES[event.type].label}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          {event.description && (
            <p className="text-gray-600">{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderDayCell = (day) => {
    if (!day) return <div className="h-24 bg-gray-50" />;
    
    const dayEvents = getEventsForDate(day);
    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === currentDate.getMonth() &&
                    new Date().getFullYear() === currentDate.getFullYear();
    
    const isSelected = selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === currentDate.getMonth() &&
                      selectedDate?.getFullYear() === currentDate.getFullYear();
    
    return (
      <div 
        className={`h-24 border border-gray-200 p-1 cursor-pointer transition-colors
          ${isToday ? 'bg-blue-50' : ''}
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          hover:bg-gray-50`}
        onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
      >
        <div className="flex justify-between">
          <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>{day}</span>
        </div>
        <div className="mt-1 space-y-1">
          {dayEvents.map((event, idx) => (
            <div 
              key={idx}
              className={`${event.color} text-white text-xs p-1 rounded truncate cursor-pointer hover:opacity-90`}
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(event);
              }}
              title={event.name}
            >
              {event.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Organization Calendar
          </h3>
          {selectedOrgId && isOrgOwned && (
            <button
              onClick={openAddEventModal}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-200 text-indigo-700 rounded-md hover:bg-indigo-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <h4>Filter by:</h4>
          {Object.keys(EVENT_TYPES).map(type => (
            <FilterChip
              key={type}
              type={type}
              isSelected={!filteredEventTypes.includes(type)}
              onToggle={() => setFilteredEventTypes(prev => 
                prev.includes(type) 
                  ? prev.filter(t => t !== type)
                  : [...prev, type]
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium">{formatMonth()}</span>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1 rounded ${viewType === 'month' ? 'bg-indigo-200 text-indigo-700' : 'hover:bg-gray-100'}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1 rounded ${viewType === 'week' ? 'bg-indigo-200 text-indigo-700' : 'hover:bg-gray-100'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1 rounded ${viewType === 'day' ? 'bg-indigo-200 text-indigo-700' : 'hover:bg-gray-100'}`}
            >
              Day
            </button>
          </div>
        </div>

        {viewType === 'month' && (
          <div className="grid grid-cols-7 gap-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-sm font-medium p-2 text-center bg-gray-50">
                {day}
              </div>
            ))}
            {getDaysArray().map((day, index) => (
              <div key={index}>
                {renderDayCell(day)}
              </div>
            ))}
          </div>
        )}

        {viewType === 'week' && <WeekView />}
        {viewType === 'day' && <DayView />}
      </div>

      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
};

export default OrgCalendar;