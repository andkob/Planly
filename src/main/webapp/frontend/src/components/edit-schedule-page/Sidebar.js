import React from "react";

export default function Sidebar({ schedules, activeScheduleId, onSelectSchedule }) {
  return (
    <div className="w-64 h-full bg-gray-100 p-4 border-r border-gray-300">
      <h2 className="text-lg font-semibold mb-4">Schedules</h2>
      <ul className="space-y-2">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <li
              key={schedule.id}
              onClick={() => onSelectSchedule(schedule.id)}
              className={`p-2 rounded cursor-pointer ${
                schedule.id === activeScheduleId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {schedule.name}
            </li>
          ))) : (
            <p>Nothing to see here...</p>
          )
        }
      </ul>
    </div>
  );
}
