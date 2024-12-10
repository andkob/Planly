import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Calendar, Users, Clock, MessageCircle, LogOut, Boxes, Menu, X, CircleEllipsis } from 'lucide-react';
import AddScheduleModal from '../modals/AddScheduleModal';
import UserSchedules from '../UserSchedules';
import Hello from './Hello'
import OrgCalendar from './OrgCalendar';
import JoinOrgModal from '../modals/JoinOrgModal';
import Toast from '../notification/Toast';
import CreateOrgModal from '../modals/CreateOrgModal';

// temp
import AddOrgModal from '../modals/AddOrgModal';
import AddEventModal from '../modals/AddEventModal';
import OrganizationEvents from '../OrganizationEvents';

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [showCreateScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showJoinOrgModal, setShowJoinOrgModal] = useState(false);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false); // TODO - TEMp
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showStartOrgModal, setShowStartOrgModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [isNewEvents, setIsNewEvents] = useState(false); // so OrganizationEvents knows when to refresh
  const [myOrganizations, setMyOrganizations] = useState([]); // List of joined organization IDs
  const [selectedOrgId, setSelectedOrgId] = useState(-1); // Selected org ID (via dropdown)
                                                          // TODO - make a global dropdown since the calendar now relies on this too
  const [ownedOrgs, setOwnedOrgs] = useState([]); // List of organizations owned by this user
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleActionMenu = () => setIsActionMenuOpen(!isActionMenuOpen);

  const openAddScheduleModal = () => setShowAddScheduleModal(true);
  const closeAddScheduleModal = () => setShowAddScheduleModal(false);
  const openJoinOrgModal = () => setShowJoinOrgModal(true);
  const closeJoinOrgModal = () => setShowJoinOrgModal(false);
  const openAddEventModal = () => setShowAddEventModal(true);
  const closeAddEventModal = () => setShowAddEventModal(false);
  const openStartOrgModal = () => setShowStartOrgModal(true);
  const closeStartOrgModal = () => setShowStartOrgModal(false);

  // TEMP - for testing purposes
  const openAddOrgModal = () => setShowAddOrgModal(true);
  const closeAddOrgModal = () => setShowAddOrgModal(false);

  const startNewOrg = (newOrgData) => {
    setOwnedOrgs(prevOrgs => [...prevOrgs, {
        id: newOrgData.id,
        name: newOrgData.name
    }]);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar')) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const fetchOwnedOrganizationIdsNames = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/organizations/owned/id-name', {
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

      const organizations = data.map(org => ({
        id: org.id,
        name: org.name
      }));
      setOwnedOrgs(organizations);
      setSelectedOrgId(organizations[0].id); // set selected org to first one
    } catch (error) {
      console.error('Error fetching organizations:', error);
      addToast('error', error.message);
    }
  }

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/users/me/organizations', {
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

      const organizations = data.map(org => ({
        id: org.id,
        name: org.name
      }));
      setMyOrganizations(organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      addToast('error', error.message);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchOwnedOrganizationIdsNames();
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
      const response = await fetch('/api/schedules/entries/me', {
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

      const response = await fetch("/api/schedules", {
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
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm p-4 flex items-center justify-between">
        <button 
          onClick={toggleSidebar} 
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <LayoutGrid className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-semibold ml-2">Dashboard</h1>
        </div>
        <button 
          onClick={toggleActionMenu} 
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle actions"
        >
          <CircleEllipsis className="h-6 w-6" />
        </button>
      </div>
  
      <div className="flex h-full">
        {/* Sidebar */}
        <div className='fixed'>
          <aside className={`
            sidebar fixed z-30
            w-64 h-screen bg-white shadow-lg
            transition-transform duration-300 ease-in-out
            overflow-y-auto
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static
          `}>
            <div className="p-4 h-full flex flex-col">
              <div className="hidden lg:flex items-center mb-6">
                <LayoutGrid className="h-8 w-8 text-indigo-500" />
                <h2 className="text-2xl font-semibold ml-2">Dashboard</h2>
              </div>
              
              <button 
                onClick={toggleSidebar}
                className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
    
              <nav className="space-y-2 flex-1">
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
                
                {/* Owned Organizations */}
                <div className="pt-4">
                  {ownedOrgs.length > 0 && <h3 className="px-2 text-sm font-semibold text-gray-600 mb-2">Owned Organizations</h3> }
                  {ownedOrgs.map((ownedOrg) => (
                    <a
                      key={ownedOrg.id}
                      href={`org/${ownedOrg.id}`}
                      className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Boxes className="h-5 w-5 mr-3" /> {ownedOrg.name}
                    </a>
                  ))}
                </div>
              </nav>
    
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center p-2 text-red-700 hover:bg-gray-100 rounded w-full text-left mt-4"
              >
                <LogOut className="h-5 w-5 mr-3" /> Logout
              </button>
            </div>
          </aside>
        </div>
  
        {/* Main Content */}
        <div className="flex-1 w-full lg:pl-64">
          <div className="p-4 lg:p-8 pt-20 lg:pt-8">
            {/* Top Action Bar */}
            <nav className="bg-white shadow-sm mb-8 rounded-lg">
              <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center">
                    <Hello />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={`
                    ${isActionMenuOpen ? 'flex' : 'hidden'} 
                    lg:flex flex-col lg:flex-row items-stretch lg:items-center gap-2
                  `}>
                    <button
                      onClick={openStartOrgModal}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-indigo-200 hover:bg-indigo-300"
                    >
                      Start an Organization
                    </button>
                    <button
                      onClick={openJoinOrgModal}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-indigo-200 hover:bg-indigo-300"
                    >
                      Join an Organization
                    </button>
                    <button
                      onClick={openAddScheduleModal}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-indigo-200 hover:bg-indigo-300"
                    >
                      Add a Schedule
                    </button>
                  </div>
                </div>
              </div>
            </nav>
  
            {/* Main Content Sections */}
            <div className="space-y-8">
              <OrganizationEvents 
                isNewEvents={isNewEvents}
                setIsNewEvents={setIsNewEvents}
                openJoinOrgModal={openJoinOrgModal}
                myOrganizations={myOrganizations}
                selectedOrgId={selectedOrgId}
                setSelectedOrgId={setSelectedOrgId}
                showDropdown={true}
              />
  
              <div className="bg-white rounded-lg shadow">
                <OrgCalendar
                  selectedOrgId={selectedOrgId}
                  openAddEventModal={openAddEventModal}
                  ownedOrgs={ownedOrgs}
                  isNewEvents={isNewEvents}
                />
              </div>
  
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium">My Schedules</h3>
                </div>
                <div className="overflow-x-auto">
                  <UserSchedules schedules={schedules} fetchSchedules={fetchSchedules} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* Modals */}
      {showStartOrgModal && (
        <CreateOrgModal
          showModal={showStartOrgModal}
          closeModal={closeStartOrgModal}
          saveOrg={startNewOrg}
          addToast={addToast}
        />
      )}
      {showAddOrgModal && (
        <AddOrgModal
          showModal={showAddOrgModal}
          closeModal={closeAddOrgModal}
        />
      )}
      {showAddEventModal && (
        <AddEventModal
          showModal={showAddEventModal}
          closeModal={closeAddEventModal}
          orgId={selectedOrgId}
          addToast={addToast}
          setIsNewEvents={setIsNewEvents}
        />
      )}
      {showJoinOrgModal && (
        <JoinOrgModal 
          showModal={showJoinOrgModal}  
          closeModal={closeJoinOrgModal}
          addToast={addToast}
        />
      )}
      {showCreateScheduleModal && (
        <AddScheduleModal
          showModal={showCreateScheduleModal}
          closeModal={closeAddScheduleModal} 
          postSchedule={postSchedule}
        />
      )}
  
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