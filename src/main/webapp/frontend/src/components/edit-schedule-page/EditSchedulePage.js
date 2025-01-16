import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  Calendar,
  BarChart,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2
} from "lucide-react";
import Sidebar from "./Sidebar";
import ScheduleEntryList from "./ScheduleEntryList";
import DayDistributionChart from "../charts/DayDistributionChart";
import Toast from '../notification/Toast';
import WeeklyScheduleGrid from "../charts/WeeklyScheduleGrid";
import { fetchUserSchedules, updateUserScheduleEntries } from "../../util/EndpointManager";

export default function EditSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [activeScheduleId, setActiveScheduleId] = useState(null);
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [oldScheduleEntries, setOldScheduleEntries] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('grid'); // 'grid' or 'chart'
  const navigate = useNavigate();
  const location = useLocation();

  const addToast = (type, message) => {
    const newToast = {
      id: toastCounter,
      type,
      message
    };
    setToasts(prev => [...prev, newToast]);
    setToastCounter(prev => prev + 1);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const fetchScheduleData = async () => {
      setIsLoading(true);
      const data = await fetchUserSchedules(setSchedules);
      if (data?.content?.length > 0) {
        const queryParams = new URLSearchParams(location.search);
        const idOpt = queryParams.get('id');
        
        if (idOpt) {
          setActiveScheduleId(parseInt(idOpt, 10)); // Convert string to number
        } else {
          setActiveScheduleId(data.content[0].id);
        }
      }
      setIsLoading(false);
    };
  
    fetchScheduleData();
  }, [location]);

  useEffect(() => {
    if (activeScheduleId) {
      const selectedSchedule = schedules.find(
        (schedule) => schedule.id === activeScheduleId
      );
      setScheduleEntries(selectedSchedule ? selectedSchedule.entries : []);
      setOldScheduleEntries(selectedSchedule ? selectedSchedule.entries : []);
    }
  }, [activeScheduleId, schedules]);

  const handleSaveChanges = () => {
    const scheduleToUpdate = {
      ...schedules.find(s => s.id === activeScheduleId),
      entries: scheduleEntries
    };
    
    updateUserScheduleEntries(
      activeScheduleId, 
      scheduleToUpdate, 
      schedules, 
      scheduleEntries, 
      setSchedules, 
      setOldScheduleEntries, 
      addToast
    );
  };

  const handleDiscardChanges = () => setScheduleEntries(oldScheduleEntries);
  const onSelectSchedule = (selectedScheduleId) => setActiveScheduleId(selectedScheduleId);
  const handleEntryChange = (updatedEntries) => setScheduleEntries(updatedEntries);

  const activeSchedule = schedules.find(s => s.id === activeScheduleId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className='flex'>
        <div className={`transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0' : 'w-64'}`}>
          <div className={`h-full transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <Sidebar
              schedules={schedules}
              activeScheduleId={activeScheduleId}
              onSelectSchedule={onSelectSchedule}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title='Return to Dashboard'
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title='Collapse Sidebar'
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeSchedule ? activeSchedule.name : 'Select a Schedule'}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setActiveView('grid')}
                  className={`px-3 py-1.5 rounded-md flex items-center space-x-2 transition-colors
                    ${activeView === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setActiveView('chart')}
                  className={`px-3 py-1.5 rounded-md flex items-center space-x-2 transition-colors
                    ${activeView === 'chart' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <BarChart className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden p-6">
          <div className="flex h-full gap-6">
            {/* Left Panel - Entry List */}
            <div className="w-96 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Schedule Entries</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ScheduleEntryList 
                  entries={scheduleEntries}
                  onEntryChange={handleEntryChange}
                />
              </div>
            </div>

            {/* Right Panel - Visualization */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {schedules.length > 0 && scheduleEntries.length > 0 ? (
                activeView === 'grid' ? (
                  <WeeklyScheduleGrid entries={scheduleEntries} />
                ) : (
                  <DayDistributionChart entries={scheduleEntries} />
                )
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>No schedule entries to display</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer Actions */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {scheduleEntries.length} entries
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 flex items-center space-x-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Discard Changes</span>
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 flex items-center space-x-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}