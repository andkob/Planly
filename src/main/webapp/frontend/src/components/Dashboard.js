import React, { useState } from 'react';
import { LayoutGrid, Calendar, Users, Clock, Search } from 'lucide-react';
import CreateSchedule from './modals/CreateSchedule';
import DropdownMenu from './DropdownMenu';
import TotalSchedules from './TotalSchedules';

export default function Dashboard({ handleFetchResponses }) {
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);

  const openModal = () => setShowCreateScheduleModal(true);
  const closeModal = () => setShowCreateScheduleModal(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LayoutGrid className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-xl font-semibold">Schedule Dashboard</span>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <DropdownMenu />
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search schedules..."
                  className="pl-8 w-64 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={handleFetchResponses}
                >
                Fetch Form Responses
              </button>
              <button 
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={openModal}
                >
                New Schedule
              </button>
              {/* Show the modal when "New Schedule" button is clicked */}
              {showCreateScheduleModal && (
                <CreateSchedule showModal={showCreateScheduleModal} closeModal={closeModal} />
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
              <h3 className="text-sm font-medium text-gray-500">Total Schedules</h3>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <TotalSchedules />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Active in last 24h</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Upcoming Events</h3>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Next 7 days</p>
          </div>
        </div>

        {/* Chart Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule Distribution Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium">Schedule Distribution</h3>
            </div>
            <div className="h-[300px] flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Chart Will Go Here</p>
            </div>
          </div>

          {/* Time Allocation Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium">Time Allocation</h3>
            </div>
            <div className="h-[300px] flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Chart Will Go Here</p>
            </div>
          </div>
        </div>

        {/* Schedule Details Table */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Recent Schedules</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Schedule Name</th>
                  <th scope="col" className="px-6 py-3">Created By</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">Team Meeting</td>
                  <td className="px-6 py-4">John Doe</td>
                  <td className="px-6 py-4">2024-10-15</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}