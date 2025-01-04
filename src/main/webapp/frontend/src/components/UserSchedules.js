import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import ScheduleVisualizations from "./ScheduleVisualizations";

export default function UserSchedules( { schedules, fetchSchedules, openAddScheduleModal } ) {
  const [expandedSchedule, setExpandedSchedule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const toggleSchedule = (scheduleId) => {
      setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
  };

  const handleEditSchedule = (scheduleId) => {
    navigate("/edit-schedule");
  };

  if (!schedules || schedules.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center text-gray-500">
        <Calendar className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">No Schedules Yet</p>
        <p className="text-sm">Create your first schedule to start organizing your time effectively.</p>
        <p className='text-md text-indigo-700 mt-2 mb-4'>
          <button 
            className="px-3 py-1 border border-gray-300 rounded-md bg-indigo-200 hover:bg-indigo-300 transition-colors"
            onClick={openAddScheduleModal}
          >
            Create Schedule
          </button>
        </p>
      </div>
    );
  }

  return (
    <ScheduleVisualizations 
      schedules={schedules}
      expandedSchedule={expandedSchedule}
      onToggle={toggleSchedule}
      onEdit={handleEditSchedule}
    />
  );
}