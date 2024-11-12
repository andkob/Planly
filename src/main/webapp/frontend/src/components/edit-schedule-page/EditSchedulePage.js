import { resolvePath, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Sidebar from "./Sidebar"; // Sidebar component with user schedules
import ScheduleEntryList from "./ScheduleEntryList";
import { useEffect, useState } from "react";
import WeeklyScheduleChart from "../charts/WeeklyScheduleChart";

export default function EditSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [activeScheduleId, setActiveScheduleId] = useState(null); // TODO - this should be set to the schedule id the user clicked edit on
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [oldScheduleEntries, setOldScheduleEntries] = useState([]);
  const navigate = useNavigate();

  // Fetch schedules on page load
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
  
    fetch("/api/schedules/get/user-entries", {
      method: "GET",
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
    .then((response) => response.json()) // Ensure JSON is fully parsed here
    .then((data) => {
      setSchedules(data)
      if (data.length > 0) setActiveScheduleId(data[0].id); // Set the first schedule as active when schedules are loaded (TEMPORARY)
    })
    .catch((error) => {
      console.error("Error fetching schedules while editing", error);
    });
  }, []);

  useEffect(() => {
    if (activeScheduleId) {
      const selectedSchedule = schedules.find(
        (schedule) => schedule.id === activeScheduleId
      );
      setScheduleEntries(selectedSchedule ? selectedSchedule.entries : []);
      setOldScheduleEntries(scheduleEntries); // in case changes are discarded
    }
  }, [activeScheduleId, schedules]);

  const handleSaveChanges = () => {
    const scheduleToUpdate = schedules.find((schedule) => schedule.id === activeScheduleId);
    console.log(JSON.stringify(scheduleToUpdate, null, 2));
    const token = localStorage.getItem("jwtToken");
    fetch(`/api/schedules/update/${activeScheduleId}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(scheduleToUpdate),
      credentials: 'include',
    })
    .then((response) => {
      response = response.json();
      console.log(JSON.stringify(response, null, 2));
    })
    .then((updatedSchedule) => {
      setSchedules(schedules.map(schedule => 
        schedule.id === activeScheduleId ? updatedSchedule : schedule
      ));
      setOldScheduleEntries(updatedSchedule.entries); // Update the old schedule entries to reflect the new state
      alert("Schedule updated successfully!");
    })
    .catch((error) => {
      console.error("Error updating schedule", error);
      alert("Failed to save changes. Please try again.");
    })
  };

  const handleDiscardChanges = () => {
    // not sure if I have to do this since we're not saving, but it'd be nice to reset everything
    setScheduleEntries(oldScheduleEntries);
  };

  const onSelectSchedule = (selectedScheduleId) => {
    setActiveScheduleId(selectedScheduleId);
  };

  const handleEntryChange = (updatedEntries) => {
    setScheduleEntries(updatedEntries);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with schedules */}
      <Sidebar
        schedules={schedules}
        activeScheduleId={activeScheduleId}
        onSelectSchedule={onSelectSchedule}
      />

      {/* Main content */}
      <div className="flex flex-col w-full p-4">
        {/* Back button */}
        <button
          className="text-blue-600 mb-4"
          onClick={() => navigate("/dashboard")}
        >
          <span className="flex items-center space-x-4">
            <ChevronLeft />
            <span>Back to Dashboard</span>
          </span>
        </button>

        <div className="flex flex-1">
          {/* Left side: Schedule entries list */}
          <div className="w-1/2 pr-4">
            <h2 className="text-xl font-semibold mb-2">Edit Schedule Entries:</h2>
            <ScheduleEntryList entries={scheduleEntries} onEntryChange={handleEntryChange} />
          </div>

          {/* Right side: Visual aids */}
          <div className="w-1/2 pl-4">
            <div className="mt-7">
              {/* Render the chart when schedules are loaded */}
              {schedules.length > 0 && scheduleEntries.length > 0 ? (
                <WeeklyScheduleChart 
                  entries={scheduleEntries} 
                  scheduleName={schedules.find(schedule => schedule.id === activeScheduleId)?.name} 
                />
              ) : (
                <p>Loading...</p> // Optional: a loading state or message
              )}
            </div>
          </div>
        </div>

        {/* Bottom right: Discard and Save buttons */}
        <div className="fixed bottom-4 right-4 space-x-2">
          <button
            onClick={handleDiscardChanges}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
