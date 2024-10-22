// ScheduleModal.js
import React, { useState } from 'react';

const AddScheduleModal = ({ showModal, closeModal, addSchedule }) => {
  const [scheduleName, setScheduleName] = useState('');
  const [days, setDays] = useState([{ day: '', time: '', eventName: '' }]);

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...days];
    updatedDays[index][field] = value;
    setDays(updatedDays);
  };

  const addDay = () => {
    setDays([...days, { day: '', time: '', eventName: '' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addSchedule({ name: scheduleName, days });
    closeModal();
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium mb-4">Create Schedule</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium">Schedule Name</label>
              <input
                type="text"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            {days.map((day, index) => (
              <div key={index} className="mb-4 flex space-x-2">
                <input
                  type="text"
                  placeholder="Day (e.g., Monday)"
                  value={day.day}
                  onChange={(e) => handleDayChange(index, 'day', e.target.value)}
                  className="block w-1/3 border border-gray-300 rounded-md p-2"
                  required
                />
                <input
                  type="time"
                  value={day.time}
                  onChange={(e) => handleDayChange(index, 'time', e.target.value)}
                  className="block w-1/3 border border-gray-300 rounded-md p-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Event Name (optional)"
                  value={day.eventName}
                  onChange={(e) => handleDayChange(index, 'eventName', e.target.value)}
                  className="block w-1/3 border border-gray-300 rounded-md p-2"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addDay}
              className="mb-4 text-blue-500 hover:underline"
            >
              Add Day
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
