import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScheduleVisualizations from "./ScheduleVisualizations";

export default function UserSchedules( { schedules, fetchSchedules } ) {
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

  return (
    <ScheduleVisualizations 
      schedules={schedules}
      expandedSchedule={expandedSchedule}
      onToggle={toggleSchedule}
      onEdit={handleEditSchedule}
    />
  );
}