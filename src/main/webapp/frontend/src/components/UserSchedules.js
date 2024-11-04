import React, { useEffect, useState } from "react";
import WeeklyScheduleChart from "./charts/WeeklyScheduleChart"

export default function UserSchedules( { schedules, fetchSchedules } ) {
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const toggleSchedule = (scheduleId) => {
      setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
  };

  return (
    <div className="p-6">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="mb-4 border-b pb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSchedule(schedule.id)}
          >
            <h4 className="text-md font-semibold">{schedule.name}</h4>
            <span>{expandedSchedule === schedule.id ? "▲" : "▼"}</span>
          </div>

          {expandedSchedule === schedule.id && (
            <div className="mt-4 flex gap-4">
              {/* Left side: WeeklyScheduleChart */}
              <div className="w-1/2">
                <WeeklyScheduleChart entries={schedule.entries || []} scheduleName={schedule.name} />
              </div>

              {/* Right side: List of events */}
              <div className="w-1/2">
                <ul className="space-y-4">
                  {schedule.entries && schedule.entries.length > 0 ? (
                    schedule.entries.map((entry) => (
                      <li key={entry.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div className="text-lg font-medium text-blue-600">{entry.eventName}</div>
                        <div className="text-gray-500 text-sm">{entry.eventDay}</div>
                        <div className="text-gray-700 text-sm">
                          {entry.eventStartTime} - {entry.eventEndTime}
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No events available.</p>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}