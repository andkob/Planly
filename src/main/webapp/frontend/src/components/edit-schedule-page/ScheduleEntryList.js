import React, { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, Clock, CalendarDays } from "lucide-react";

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export default function ScheduleEntryList({ entries, onEntryChange }) {
  const [editedEntries, setEditedEntries] = useState(entries || []);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [newEntryIds, setNewEntryIds] = useState(new Set());

  useEffect(() => {
    setEditedEntries(entries || []);
  }, [entries]);

  // Clear highlight after delay
  useEffect(() => {
    const timers = Array.from(newEntryIds).map(id =>
      setTimeout(() => {
        setNewEntryIds(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      }, 10000) // flash for 10 seconds
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [newEntryIds]);

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...editedEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
    setEditedEntries(updatedEntries);
    onEntryChange(updatedEntries);
  };

  const addNewEntry = () => {
    const newEntry = {
      id: Date.now(),
      eventDay: "Monday",
      eventStartTime: "09:00",
      eventEndTime: "10:00",
      eventName: ""
    };
    const updatedEntries = [newEntry, ...editedEntries];
    setEditedEntries(updatedEntries);
    onEntryChange(updatedEntries);
    setNewEntryIds(prev => new Set(prev).add(newEntry.id));
  };

  const deleteEntry = (index) => {
    const updatedEntries = editedEntries.filter((_, i) => i !== index);
    setEditedEntries(updatedEntries);
    onEntryChange(updatedEntries);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDropIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const updatedEntries = [...editedEntries];
    const [movedEntry] = updatedEntries.splice(draggedIndex, 1);
    updatedEntries.splice(index, 0, movedEntry);
    
    setEditedEntries(updatedEntries);
    onEntryChange(updatedEntries);
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={addNewEntry}
        className="w-full flex items-center justify-center px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg 
                 hover:bg-indigo-100 transition-colors group mb-6"
      >
        <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        Add New Event
      </button>

      {(!editedEntries || editedEntries.length === 0) ? (
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">No Events Yet</h3>
          <p className="text-gray-500 text-sm">
            Click the button above to add your first schedule event.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {editedEntries.map((entry, index) => (
            <div 
              key={entry.id || index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-lg border transition-all duration-500
                ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
                ${dropIndex === index ? 'border-indigo-500 shadow-md' : 'border-gray-200'}
                ${newEntryIds.has(entry.id) ? 'border-green-500 shadow-md animate-pulse' : ''}
                ${index === editedEntries.length - 1 ? '' : 'mb-3'}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-3 border-b border-gray-100 
                ${newEntryIds.has(entry.id) ? 'bg-green-50' : ''}`}>
                <div className="flex items-center space-x-2">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <input
                    type="text"
                    value={entry.eventName || ""}
                    onChange={(e) => handleEntryChange(index, "eventName", e.target.value)}
                    className="text-gray-900 font-medium bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-400"
                    placeholder="Event name"
                  />
                </div>
                <button
                  onClick={() => deleteEntry(index)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 space-y-3">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <select
                    value={entry.eventDay}
                    onChange={(e) => handleEntryChange(index, "eventDay", e.target.value)}
                    className="flex-1 border-0 bg-gray-50 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-indigo-500"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="time"
                      value={entry.eventStartTime || ""}
                      onChange={(e) => handleEntryChange(index, "eventStartTime", e.target.value)}
                      className="border-0 bg-gray-50 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={entry.eventEndTime || ""}
                      onChange={(e) => handleEntryChange(index, "eventEndTime", e.target.value)}
                      className="border-0 bg-gray-50 rounded-md text-gray-900 text-sm focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {entry.eventStartTime && entry.eventEndTime && (
                  <div className="text-xs text-gray-500 pl-7">
                    {formatTime(entry.eventStartTime)} - {formatTime(entry.eventEndTime)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}