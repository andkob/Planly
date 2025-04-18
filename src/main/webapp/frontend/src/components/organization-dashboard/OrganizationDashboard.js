import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Settings, 
  MessageCircle,
  ChevronLeft,
  UserPlus,
  CalendarPlus
} from 'lucide-react';

import AddEventModal from '../modals/AddEventModal';
import OrganizationEvents from '../OrganizationEvents';
import Toast from '../notification/Toast';
import OrganizationMembers from './OrganizationMembers';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import { fetchOrganizationDetails } from '../../util/EndpointManager';

export default function OrganizationDashboard() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [orgDetails, setOrgDetails] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isNewEvents, setIsNewEvents] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [toastCounter, setToastCounter] = useState(0);

  const addToast = useCallback((type, message) => {
    const newToast = {
      id: toastCounter,
      type,
      message
    };
    setToasts(prev => [...prev, newToast]);
    setToastCounter(prev => prev + 1);
  }, [toastCounter]);

  useEffect(() => {
    fetchOrganizationDetails(orgId, setOrgDetails, addToast);
  }, [orgId, addToast]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-4 space-y-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {orgDetails?.name || 'Loading...'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {orgDetails?.description || 'Organization Dashboard'}
          </p>
        </div>

        <nav className="space-y-2">
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <Users className="h-5 w-5 mr-3" /> Members
          </a>
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <Calendar className="h-5 w-5 mr-3" /> Events
          </a>
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <MessageCircle className="h-5 w-5 mr-3" /> Announcements
          </a>
          <a href="#" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
            <Settings className="h-5 w-5 mr-3" /> Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Top Action Bar */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Organization Management
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddEventModal(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                <CalendarPlus className="h-5 w-5 mr-2" />
                Add Event
              </button>
              <button
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Invite Members
              </button>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <OrganizationEvents
            isNewEvents={isNewEvents}
            setIsNewEvents={setIsNewEvents}
            openJoinOrgModal={() => {}}
            myOrganizations={[{ id: orgId, name: orgDetails?.name }]}
            selectedOrgId={orgId}
            setSelectedOrgId={() => {}}
            showDropdown={false}
          />
        </div>

        <div className='bg-white rounded-lg shadow mb-8'>
          <AvailabilityHeatmap orgId={orgId} />
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Members</h3>
          </div>
          <div className="p-6">
            <OrganizationMembers orgId={orgId} addToast={addToast} />
          </div>
        </div>

        {/* Modals */}
        {showAddEventModal && (
          <AddEventModal
            showModal={showAddEventModal}
            closeModal={() => setShowAddEventModal(false)}
            orgId={orgId}
            addToast={addToast}
            setIsNewEvents={setIsNewEvents}
          />
        )}

        {/* Toasts */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}