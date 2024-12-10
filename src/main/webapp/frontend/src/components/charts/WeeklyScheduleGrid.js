import React, { useState, useRef, useEffect } from 'react';

export default function WeeklyScheduleGrid({ entries = [], height = 800, hourInterval = 1 }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0 });
  const [useDayLetters, setUseDayLetters] = useState(false);
  const containerRef = useRef(null);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayLetters = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
  const hours = Array.from({ length: Math.ceil(24/hourInterval) }, (_, i) => i * hourInterval);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 80;
        setDimensions({ width });
        setUseDayLetters(width / 7 < 100);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getOverlappingEvents = (event, allEvents) => {
    return allEvents.filter(e => 
      e.eventDay === event.eventDay &&
      timeToMinutes(e.eventStartTime) < timeToMinutes(event.eventEndTime) &&
      timeToMinutes(e.eventEndTime) > timeToMinutes(event.eventStartTime)
    );
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calcEventStyle = (entry, index) => {
    const colors = [
      'bg-blue-200 border-blue-400',
      'bg-green-200 border-green-400', 
      'bg-yellow-200 border-yellow-400',
      'bg-red-200 border-red-400',
      'bg-purple-200 border-purple-400'
    ];
    
    const startMinutes = timeToMinutes(entry.eventStartTime);
    const endMinutes = timeToMinutes(entry.eventEndTime);
    const top = (startMinutes * height) / 1440;
    const eventHeight = ((endMinutes - startMinutes) * height) / 1440;
    
    const dayIndex = days.indexOf(entry.eventDay);
    const colWidth = dimensions.width / 7;

    const overlapping = getOverlappingEvents(entry, entries);
    const offset = overlapping.indexOf(entry) * 5;
    
    const isHovered = hoveredEvent?.eventName === entry.eventName;
    const zIndex = isHovered ? 50 : overlapping.length - overlapping.indexOf(entry);

    return {
      position: 'absolute',
      top: `${top}px`,
      left: `${dayIndex * colWidth + 2 + offset}px`,
      height: `${eventHeight}px`,
      width: `${colWidth - 4 - (overlapping.length - 1) * 5}px`,
      zIndex,
      className: `${colors[index % colors.length]} p-1 rounded border cursor-pointer text-xs 
                 overflow-hidden transition-all duration-200 
                 hover:shadow-lg hover:brightness-95`
    };
  };

  return (
    <div ref={containerRef} className="relative bg-white p-4 rounded shadow w-full">
      <div className="flex mb-2 pl-16">
        {days.map((day, i) => (
          <div key={day} style={{ width: `${dimensions.width / 7}px` }} className="text-center font-medium">
            {useDayLetters ? dayLetters[i] : day}
          </div>
        ))}
      </div>
      
      <div className="relative flex" style={{ height: `${height}px` }}>
        <div className="absolute left-0 w-16 h-full">
          {hours.map(hour => (
            <div key={hour} style={{ top: `${(hour * height) / 24}px` }}
                 className="absolute w-full text-xs text-gray-500 text-right pr-2 -translate-y-1/2">
              {`${hour}:00`}
            </div>
          ))}
        </div>

        <div className="relative flex-1 ml-16">
          <div className="absolute inset-0 grid grid-cols-7 divide-x divide-gray-200">
            {days.map(day => (
              <div key={day} className="h-full" />
            ))}
          </div>

          {hours.map(hour => (
            <div key={hour} style={{ top: `${(hour * height) / 24}px` }}
                 className="absolute w-full border-t border-gray-100" />
          ))}
          
          {entries.map((entry, i) => {
            const style = calcEventStyle(entry, i);
            return (
              <div key={i} 
                   style={style} 
                   className={style.className}
                   onClick={() => setSelectedEvent(entry)}
                   onMouseEnter={() => setHoveredEvent(entry)}
                   onMouseLeave={() => setHoveredEvent(null)}>
                {entry.eventName}
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-lg border z-50">
          <h4 className="font-medium mb-2">{selectedEvent.eventName}</h4>
          <p className="text-sm text-gray-600">
            {selectedEvent.eventDay} {selectedEvent.eventStartTime}-{selectedEvent.eventEndTime}
          </p>
          <button onClick={() => setSelectedEvent(null)}
                  className="mt-2 text-sm text-gray-500">
            Close
          </button>
        </div>
      )}
    </div>
  );
}