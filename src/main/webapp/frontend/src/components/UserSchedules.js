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
            <WeeklyScheduleChart entries={schedule.entries || []} />
          )}
        </div>
      ))}
    </div>
  );
}