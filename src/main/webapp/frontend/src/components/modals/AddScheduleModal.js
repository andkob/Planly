import React, { useState } from 'react';
import { Clock, Plus, X, Calendar, Type, Repeat } from 'lucide-react';
import { postNewSchedule } from '../../util/EndpointManager';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const AddScheduleModal = ({ showModal, closeModal, setSchedules, addToast }) => {
  const [scheduleName, setScheduleName] = useState('');
  const [entries, setEntries] = useState([{
    eventDay: '',
    repeatingDays: [],
    eventStartTime: '',
    eventEndTime: '',
    eventName: '',
    isRepeating: false
  }]);

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const handleDayToggle = (index, day) => {
    const updatedEntries = [...entries];
    const currentDays = updatedEntries[index].repeatingDays;
    
    if (currentDays.includes(day)) {
      updatedEntries[index].repeatingDays = currentDays.filter(d => d !== day);
    } else {
      updatedEntries[index].repeatingDays = [...currentDays, day].sort(
        (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
      );
    }
    
    setEntries(updatedEntries);
  };

  const addEntry = () => {
    setEntries([...entries, {
      eventDay: '',
      repeatingDays: [],
      eventStartTime: '',
      eventEndTime: '',
      eventName: '',
      isRepeating: false
    }]);
  };

  const removeEntry = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
  };

  const toggleRepeating = (index) => {
    const updatedEntries = [...entries];
    updatedEntries[index].isRepeating = !updatedEntries[index].isRepeating;
    if (!updatedEntries[index].isRepeating) {
      updatedEntries[index].repeatingDays = [];
    }
    setEntries(updatedEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Transform entries to handle repeating events
    const transformedEntries = entries.flatMap(entry => {
      if (entry.isRepeating && entry.repeatingDays.length > 0) {
        // Create separate entries for each repeating day
        return entry.repeatingDays.map(day => ({
          eventDay: day,
          eventStartTime: entry.eventStartTime,
          eventEndTime: entry.eventEndTime,
          eventName: entry.eventName
        }));
      }
      // Return single entry for non-repeating events
      return [{
        eventDay: entry.eventDay,
        eventStartTime: entry.eventStartTime,
        eventEndTime: entry.eventEndTime,
        eventName: entry.eventName
      }];
    });

    const scheduleData = {
      name: scheduleName,
      entries: transformedEntries
    };
    
    await postNewSchedule(scheduleData, setSchedules, closeModal, addToast);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-50 px-6 py-4 flex justify-between items-center border-b border-indigo-100">
          <h3 className="text-xl font-semibold text-indigo-900">Create New Schedule</h3>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
          {/* Schedule Name Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 p-3">
              <Type className="w-5 h-5 text-indigo-500" />
              <input
                type="text"
                placeholder="Enter schedule name (e.g. Work Schedule, Class Schedule)"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                className="flex-1 outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* Events Section */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Schedule Events</h4>
              <button
                type="button"
                onClick={addEntry}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>

            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-gray-700">Event {index + 1}</h5>
                    {entries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEntry(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 p-3">
                        <Type className="w-5 h-5 text-indigo-500" />
                        <input
                          type="text"
                          placeholder="Event Name"
                          value={entry.eventName}
                          onChange={(e) => handleEntryChange(index, 'eventName', e.target.value)}
                          className="flex-1 outline-none text-gray-700"
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 p-3">
                        <Repeat 
                          className={`w-5 h-5 ${entry.isRepeating ? 'text-indigo-500' : 'text-gray-400'}`}
                        />
                        <button
                          type="button"
                          onClick={() => toggleRepeating(index)}
                          className={`text-sm ${entry.isRepeating ? 'text-indigo-600' : 'text-gray-600'}`}
                        >
                          {entry.isRepeating ? 'Repeating Event' : 'Single Event'}
                          <span> (Click to change)</span>
                        </button>
                      </div>

                      {!entry.isRepeating && (
                        <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 p-3">
                          <Calendar className="w-5 h-5 text-indigo-500" />
                          <select
                            value={entry.eventDay}
                            onChange={(e) => handleEntryChange(index, 'eventDay', e.target.value)}
                            className="flex-1 outline-none text-gray-700 bg-transparent"
                            required={!entry.isRepeating}
                          >
                            <option value="" disabled>Select Day</option>
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 p-3">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        <input
                          type="time"
                          value={entry.eventStartTime}
                          onChange={(e) => handleEntryChange(index, 'eventStartTime', e.target.value)}
                          className="flex-1 outline-none text-gray-700"
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 p-3">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        <input
                          type="time"
                          value={entry.eventEndTime}
                          onChange={(e) => handleEntryChange(index, 'eventEndTime', e.target.value)}
                          className="flex-1 outline-none text-gray-700"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Repeating Days Selection */}
                  {entry.isRepeating && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(index, day)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                              ${entry.repeatingDays.includes(day)
                                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                                : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                              }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;