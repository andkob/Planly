import React, { useState } from 'react';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const AddScheduleModal = ({ showModal, closeModal, postSchedule }) => {
  const [scheduleName, setScheduleName] = useState('');
  const [days, setDays] = useState([{ day: '', startTime: '', endTime: '', eventName: '' }]);

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...days];
    updatedDays[index][field] = value;
    setDays(updatedDays);
  };

  const addEvent = () => {
    setDays([...days, { day: '', startTime: '', endTime: '', eventName: '' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const scheduleData = { name: scheduleName, days };
    postSchedule(scheduleData)
    closeModal();
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-hidden">
          <h3 className="text-lg font-medium mb-4">Create Schedule</h3>
          <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium">Schedule Name</label>
              <input
                type="text"
                placeholder="e.g. Work"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            {days.map((day, index) => (
              <div key={index} className="mb-4 flex space-x-2">
                <select
                  value={day.day}
                  onChange={(e) => handleDayChange(index, 'day', e.target.value)}
                  className="block w-1/3 border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="" disabled>Select Day</option>
                  {daysOfWeek.map((dayName) => (
                    <option key={dayName} value={dayName}>{dayName}</option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ⏰
                  </span>
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => handleDayChange(index, 'startTime', e.target.value)}
                    className="block border border-gray-300 rounded-md p-2 pl-8" // Add padding-left for the emoji
                    required
                  />
                </div>
                
                <div className="flex-1 relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ⏳
                  </span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => handleDayChange(index, 'endTime', e.target.value)}
                    className="block border border-gray-300 rounded-md p-2 pl-8" // Add padding-left for the emoji
                    required
                  />
                </div>

                <input
                  type="text"
                  placeholder="Event Name"
                  value={day.eventName}
                  onChange={(e) => handleDayChange(index, 'eventName', e.target.value)}
                  className="block w-1/3 border border-gray-300 rounded-md p-2"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addEvent}
              className="mb-4 text-blue-500 hover:underline"
            >
              Add Event
            </button>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default AddScheduleModal;
