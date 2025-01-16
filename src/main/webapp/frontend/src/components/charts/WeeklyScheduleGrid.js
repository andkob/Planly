import React, { useState, useRef, useEffect } from 'react';
import { Clock, X, CalendarDays } from 'lucide-react';

export default function WeeklyScheduleGrid({ 
  entries = [], 
  customCellHeight = -1, 
  hourInterval = 1 
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [cellHeight, setCellHeight] = useState(50);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayLetters = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: Math.ceil(24/hourInterval) }, (_, i) => i * hourInterval);

  const totalHeight = cellHeight * 24;

  useEffect(() => {
    const updateDimensions = () => {
      const calculateCellHeight = () => {
        if (customCellHeight !== -1) {
          return customCellHeight;
        }
        if (!containerRef.current) return 50;
        const containerHeight = containerRef.current.clientHeight;
        return Math.max(30, Math.floor((containerHeight - 60) / 24));
      };
      
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Subtract the width of the time labels column (56px) and some padding
        const availableWidth = containerWidth - 56;
        setDimensions({ width: availableWidth });
        const newCellHeight = calculateCellHeight();
        setCellHeight(newCellHeight);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [customCellHeight]);

  useEffect(() => {
    if (gridRef.current) {
      const businessHourStart = 9;
      const scrollTo = (totalHeight / 24) * businessHourStart;
      gridRef.current.scrollTop = scrollTo;
      setScrollPosition(scrollTo);
    }
  }, [totalHeight]);

  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollTop);
  };

  const getOverlappingEvents = (event, allEvents) => {
    return allEvents.filter(e => 
      e.eventDay === event.eventDay &&
      timeToMinutes(e.eventStartTime) < timeToMinutes(event.eventEndTime) &&
      timeToMinutes(e.eventEndTime) > timeToMinutes(event.eventStartTime)
    );
  };

  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  const calcEventStyle = (entry, index) => {
    const colors = [
      { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', hover: 'hover:bg-blue-200' },
      { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', hover: 'hover:bg-emerald-200' },
      { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-800', hover: 'hover:bg-violet-200' },
      { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', hover: 'hover:bg-amber-200' },
      { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800', hover: 'hover:bg-rose-200' }
    ];
    
    const startMinutes = timeToMinutes(entry.eventStartTime);
    const endMinutes = timeToMinutes(entry.eventEndTime);
    const top = (startMinutes * totalHeight) / 1440;
    const eventHeight = Math.max(
      cellHeight * 0.5,
      ((endMinutes - startMinutes) * totalHeight) / 1440
    );
    
    const dayIndex = days.indexOf(entry.eventDay);
    const colWidth = dimensions.width / 7;
    
    const overlapping = getOverlappingEvents(entry, entries);
    const offset = overlapping.indexOf(entry) * 5;
    
    const isHovered = hoveredEvent?.eventName === entry.eventName;
    const zIndex = isHovered ? 50 : overlapping.length - overlapping.indexOf(entry);

    const color = colors[index % colors.length];

    return {
      position: 'absolute',
      top: `${top}px`,
      left: `${dayIndex * colWidth + 2 + offset}px`,
      height: `${eventHeight}px`,
      width: `${colWidth - 4 - (overlapping.length - 1) * 5}px`,
      zIndex,
      className: `${color.bg} ${color.border} ${color.text} ${color.hover} 
                 p-2 rounded-lg border-2 cursor-pointer text-sm font-medium
                 overflow-hidden transition-all duration-200
                 hover:shadow-lg hover:scale-[1.02]
                 ${customCellHeight && customCellHeight < 30 ? 'text-xs p-1' : ''}`
    };
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (minutes * totalHeight) / 1440;
  };

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const columnWidth = dimensions.width / 7;

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40 shrink-0">
        <div className="flex pl-14">
          {days.map((day, i) => (
            <div 
              key={day} 
              style={{ width: `${columnWidth}px` }}
              className="py-3 text-center border-r border-gray-100 last:border-r-0"
            >
              <div className="font-bold text-gray-900">
                {columnWidth < 120 ? dayLetters[i] : day}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + i))
                  .toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Grid */}
      <div 
        ref={gridRef}
        onScroll={handleScroll} 
        className="flex-1 overflow-y-auto relative"
        style={{ height: customCellHeight ? `${totalHeight + 60}px` : 'calc(100% - 60px)' }}
      >
        <div className="relative flex" style={{ height: `${totalHeight}px` }}>
          {/* Time labels */}
          <div className="sticky left-0 w-14 h-full bg-gray-50 border-r border-gray-200 z-20">
            {hours.map(hour => (
              <div 
                key={hour} 
                style={{ 
                  top: `${(hour * totalHeight) / 24}px`,
                  height: `${cellHeight}px`,
                  lineHeight: `${cellHeight}px`
                }}
                className="absolute w-full text-xs font-medium text-gray-600 text-right pr-2"
              >
                {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="relative flex-1">
            <div className="absolute inset-0" style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(7, ${columnWidth}px)`,
              width: `${dimensions.width}px`
            }}>
              {days.map(day => (
                <div key={day} className="h-full relative border-r border-gray-100 last:border-r-0">
                  <div className="absolute inset-0 bg-gray-50 opacity-50" />
                </div>
              ))}
            </div>

            {/* Hour lines */}
            {hours.map(hour => (
              <div 
                key={hour}
                style={{ 
                  top: `${(hour * totalHeight) / 24}px`,
                  width: `${dimensions.width}px`
                }}
                className={`absolute border-t ${hour === 12 ? 'border-gray-300' : 'border-gray-100'}`} 
              />
            ))}

            {/* Current time line */}
            <div 
              style={{ 
                top: `${getCurrentTimePosition()}px`,
                width: `${dimensions.width}px`
              }}
              className="absolute h-0.5 bg-red-500 z-30"
            >
              <div className="absolute -left-14 -translate-y-1/2 w-14 flex items-center justify-end pr-2">
                <span className="text-xs font-medium text-red-500">{formatCurrentTime()}</span>
              </div>
            </div>

            {/* Events */}
            {entries.map((entry, i) => {
              const style = calcEventStyle(entry, i);
              return (
                <div 
                  key={i} 
                  style={style} 
                  className={style.className}
                  onClick={() => setSelectedEvent(entry)}
                  onMouseEnter={() => setHoveredEvent(entry)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  <div className="font-semibold truncate">{entry.eventName}</div>
                  {(!customCellHeight || customCellHeight >= 20) && (
                    <div className="text-xs opacity-75 truncate">
                      {formatTime(entry.eventStartTime)} - {formatTime(entry.eventEndTime)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedEvent.eventName}</h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <CalendarDays className="w-5 h-5 mr-3 text-gray-400" />
                <span>{selectedEvent.eventDay}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                <span>{formatTime(selectedEvent.eventStartTime)} - {formatTime(selectedEvent.eventEndTime)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}