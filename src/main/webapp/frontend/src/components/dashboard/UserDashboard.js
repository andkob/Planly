import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Calendar, Users, Clock, MessageCircle, LogOut } from 'lucide-react';
import AddScheduleModal from '../modals/AddScheduleModal';
import UserSchedules from '../UserSchedules';
import Hello from './Hello'
import CalendarSection from './CalendarSection';
import JoinOrgModal from '../modals/JoinOrgModal';
import Toast from '../notification/Toast';

// temp
import AddOrgModal from '../modals/TEMP/AddOrgModal';
import AddEventModal from '../modals/AddEventModal';
import OrganizationEvents from '../OrganizationEvents';

export default function UserDashboard() {
  const [toasts, setToasts] = useState([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [showCreateScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showJoinOrgModal, setShowJoinOrgModal] = useState(false);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false); // TODO - TEMp
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [isNewEvents, setIsNewEvents] = useState(false); // so OrganizationEvents knows when to refresh
  const [myOrganizations, setMyOrganizations] = useState([]); // List of joined organization IDs
  const [selectedOrgId, setSelectedOrgId] = useState(-1); // Selected org ID (via dropdown) for viewing events (only this for now)
  const navigate = useNavigate();

  const openAddScheduleModal = () => setShowAddScheduleModal(true);
  const closeAddScheduleModal = () => setShowAddScheduleModal(false);
  const openJoinOrgModal = () => setShowJoinOrgModal(true);
  const closeJoinOrgModal = () => setShowJoinOrgModal(false);
  const openAddEventModal = () => setShowAddEventModal(true);
  const closeAddEventModal = () => setShowAddEventModal(false);

  // TEMP - for testing purposes
  const openAddOrgModal = () => setShowAddOrgModal(true);
  const closeAddOrgModal = () => setShowAddOrgModal(false);

  const addNewOrg = (newOrgId) => {
    myOrganizations.push(newOrgId);
    setMyOrganizations(myOrganizations);
  };

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/user/get/joined-orgs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch joined organizations');
      }
      const data = await response.json();

      // Extract only the IDs from the OrganizationIdNameDTO objects
      const organizations = data.map(org => ({
        id: org.id,
        name: org.name
      }));
      setMyOrganizations(organizations);
      console.log(JSON.stringify(data, null, 2)); // TODO remove
    } catch (error) {
      console.error('Error fetching organizations:', error);
      addToast('error', error.message);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData),
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Schedule saved successfully');
        closeAddScheduleModal();
        fetchSchedules(); // update list
      } else {
        alert('Error saving schedule');
      }

    } catch (error) {
      console.error("Error: " + error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login?logout=true');
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
          <a href="edit-schedule" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
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
          <button
            onClick={handleLogout}
            className="flex items-center p-2 text-red-700 hover:bg-gray-100 rounded w-full text-left"
          >
            <LogOut className="h-5 w-5 mr-3" /> Logout
          </button>
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
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-orange-700 hover:bg-gray-50"
                onClick={openAddOrgModal}
              >
                add an org (test)
              </button>
              {showAddOrgModal && (
                <AddOrgModal
                  showModal={showAddOrgModal}
                  closeModal={closeAddOrgModal}
                />
              )}

              {/* TEMPORARY (should only be used for organizations for now) */}
              <button
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-yellow-300 hover:bg-gray-50"
                onClick={openAddEventModal}
              >
                Add event (org)
              </button>
              {showAddEventModal && (
                <AddEventModal
                  showModal={showAddEventModal}
                  closeModal={closeAddEventModal}
                  orgId={selectedOrgId}
                  addToast={addToast}
                  setIsNewEvents={setIsNewEvents}
                />
              )}
              {/* END TEMP */}

              <button
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={openJoinOrgModal}
              >
                Join an Organization
              </button>
              {showJoinOrgModal && (
                <JoinOrgModal 
                  showModal={showJoinOrgModal}  
                  closeModal={closeJoinOrgModal}
                  addToast={addToast}
                />
              )}
              <button 
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={openAddScheduleModal}
              >
                Add a schedule
              </button>
              {showCreateScheduleModal && (
                <AddScheduleModal
                  showModal={showCreateScheduleModal}
                  closeModal={closeAddScheduleModal} 
                  postSchedule={postSchedule}
                />
              )}
            </div>
          </div>
        </nav>

        {/* Main dashboard sections */}
        <OrganizationEvents 
          isNewEvents={isNewEvents}
          setIsNewEvents={setIsNewEvents}
          openJoinOrgModal={openJoinOrgModal}
          myOrganizations={myOrganizations} // Array of {id, name} objects
          selectedOrgId={selectedOrgId}
          setSelectedOrgId={setSelectedOrgId}
        />

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
      
      {/* Toast notifications container */}
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