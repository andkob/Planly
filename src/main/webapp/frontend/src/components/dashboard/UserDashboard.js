import React, { useState } from 'react';
import { LayoutGrid, Calendar, Users, Clock, MessageCircle } from 'lucide-react';
import AddScheduleModal from '../modals/AddScheduleModal';
import UserSchedules from '../UserSchedules';
import Hello from './Hello'
import CalendarSection from './CalendarSection';

export default function UserDashboard() {
  const [showCreateScheduleModal, setShowAddScheduleModal] = useState(false);
  const [schedules, setSchedules] = useState([]);

  const openModal = () => setShowAddScheduleModal(true);
  const closeModal = () => setShowAddScheduleModal(false);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/schedules/get/user-entries', {
        method: "GET",
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      }); 
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
        console.error("Error fetching schedules: ", error);
    }
  };

  const postSchedule = async (scheduleData) => {
    try {
      // get the JWT token
      const token = localStorage.getItem('jwtToken');

      const response = await fetch("/api/schedules/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` // Include the JWT token in the auth header
        },
        body: JSON.stringify(scheduleData),
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Schedule saved successfully');
        closeModal();
        fetchSchedules(); // update list
      } else {
        alert('Error saving schedule');
      }

    } catch (error) {
      console.error("Error: " + error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-4 space-y-4">
        <div className='flex items-center'>
          <LayoutGrid className="h-8 w-8 text-indigo-500" />
          <h2 className="text-2xl font-semibold ml-2 mb-1">Dashboard</h2>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <Users className="h-5 w-5 mr-3" /> Organizations
          </a>
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <Calendar className="h-5 w-5 mr-3" /> Events
          </a>
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <Clock className="h-5 w-5 mr-3" /> Schedules
          </a>
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <Calendar className="h-5 w-5 mr-3" /> My Calendar
          </a>
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <Calendar className="h-5 w-5 mr-3" /> Organization Calendar
          </a>
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <MessageCircle className="h-5 w-5 mr-3" /> Chat
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <nav className="bg-white shadow-sm mb-8">
          <div className="flex justify-between h-16 px-6">
            <div className="flex items-center">
            <Hello />
            </div>
            <div className="flex items-center">
              <button 
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={openModal}
              >
                Add a schedule
              </button>
              {showCreateScheduleModal && (
                <AddScheduleModal
                  showModal={showCreateScheduleModal}
                  closeModal={closeModal} 
                  postSchedule={postSchedule}
                />
              )}
            </div>
          </div>
        </nav>

        {/* Main dashboard sections */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Upcoming Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Event Name</th>
                  <th scope="col" className="px-6 py-3">Created By</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">Camping Trip</td>
                  <td className="px-6 py-4">PDT</td>
                  <td className="px-6 py-4">2024-10-15</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Brotherhood
                    </span>
                  </td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">Chapter Meeting</td>
                  <td className="px-6 py-4">PDT</td>
                  <td className="px-6 py-4">2024-10-19</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-300 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Mandatory
                    </span>
                  </td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">Food Pantry</td>
                  <td className="px-6 py-4">PDT</td>
                  <td className="px-6 py-4">2024-10-24</td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-300 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Community Service
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className='mt-8 bg-white rounded-lg shadow'>
          <CalendarSection />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">My Schedules</h3>
          </div>
          <div className="overflow-x-auto">
            <UserSchedules schedules={schedules} fetchSchedules={fetchSchedules} />
          </div>
        </div>
      </div>
    </div>
  );
}