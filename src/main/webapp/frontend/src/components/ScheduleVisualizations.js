import React from 'react';
import { Calendar, Clock, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import WeeklyScheduleGrid from './charts/WeeklyScheduleGrid';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const SortedScheduleVisualizations = ({ schedules, expandedSchedule, onToggle, onEdit }) => {
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000/01/01 ${startTime}`);
    const end = new Date(`2000/01/01 ${endTime}`);
    return (end - start) / (1000 * 60);
  };

  const sortEntriesByDay = (entries) => {
    if (!entries) return [];
    
    // Create an object to hold entries for each day
    const entriesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});

    // Sort entries into their respective days
    entries.forEach(entry => {
      if (entriesByDay[entry.eventDay]) {
        entriesByDay[entry.eventDay].push(entry);
      }
    });

    // Sort entries within each day by start time
    Object.keys(entriesByDay).forEach(day => {
      entriesByDay[day].sort((a, b) => {
        return a.eventStartTime.localeCompare(b.eventStartTime);
      });
    });

    return entriesByDay;
  };

  return (
    <div className="p-6">
      {schedules.map((schedule) => {
        const sortedEntries = sortEntriesByDay(schedule.entries);
        
        return (
          <div key={schedule.id} className="mb-4 border-b pb-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => onToggle(schedule.id)}
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h4 className="text-md font-semibold">{schedule.name}</h4>
                <span className="text-sm text-gray-500">
                  ({schedule.entries?.length || 0} events)
                </span>
              </div>
              <span className="flex items-center space-x-4">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(schedule.id);
                  }}
                  className="p-2 hover:bg-gray-200 rounded cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </span>
                {expandedSchedule === schedule.id ? <ChevronUp /> : <ChevronDown />}
              </span>
            </div>

            {expandedSchedule === schedule.id && (
              <div className="mt-6 space-y-6">
                {/* Weekly Schedule Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <WeeklyScheduleGrid entries={schedule.entries} customCellHeight={25} hourInterval={2} />
                </div>

                {/* Event List Grouped by Day */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Time Distribution</h4>
                  <div className="space-y-6">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="space-y-3">
                        {sortedEntries[day] && sortedEntries[day].length > 0 && (
                          <>
                            <h5 className="text-sm font-semibold text-gray-600 border-b pb-2">
                              {day}
                            </h5>
                            {sortedEntries[day].map((entry) => {
                              const duration = calculateDuration(
                                entry.eventStartTime,
                                entry.eventEndTime
                              );
                              return (
                                <div
                                  key={entry.id}
                                  className="flex items-center p-3 bg-white rounded-lg shadow-sm"
                                >
                                  <Clock className="w-4 h-4 text-gray-400 mr-3" />
                                  <div className="flex-1">
                                    <div className="font-medium">{entry.eventName}</div>
                                    <div className="text-sm text-gray-500">
                                      {entry.eventStartTime} - {entry.eventEndTime}
                                      <span className="ml-2 text-blue-500">
                                        ({duration} mins)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    ))}
                    {!schedule.entries || schedule.entries.length === 0 && (
                      <p className="text-sm text-gray-500">No events available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SortedScheduleVisualizations;