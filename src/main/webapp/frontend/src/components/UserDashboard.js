import React, { useState } from 'react';
import { LayoutGrid, Calendar, Users, Clock } from 'lucide-react';
import AddScheduleModal from './modals/AddScheduleModal';

export default function UserDashboard() {
  const [showCreateScheduleModal, setShowAddScheduleModal] = useState(false);
  const [schedules, setSchedules] = useState([]);

  const openModal = () => setShowAddScheduleModal(true);
  const closeModal = () => setShowAddScheduleModal(false);

  const addSchedule = (newSchedule) => {
    setSchedules([...schedules, newSchedule]);
    console.log('Schedules:', schedules); // You can handle saving schedules to your backend here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LayoutGrid className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-xl font-semibold">Dashboard</span>
            </div>
            <div className="flex items-center">
              <button 
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={openModal}
                >
                Add a schedule
              </button>
              {/* Show the modal when "New Schedule" button is clicked */}
              {showCreateScheduleModal && (
                <AddScheduleModal
                  showModal={showCreateScheduleModal}
                  closeModal={closeModal} 
                  addSchedule={addSchedule}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Schedules</h3>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            {/* Here should list the name of each schedule the user has*/}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Organizations</h3>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-500">Joined Organizations</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Upcoming Events</h3>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-500">Next 7 days</p>
          </div>
        </div>

        {/* Upcoming Events Table*/}
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

        {/* User's Schedules Section */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">My Schedules</h3>
          </div>
          <div className="overflow-x-auto">
            {/* <UserSchedules /> Component to display user's schedules */}
          </div>
        </div>

      </main>
    </div>
  );
}