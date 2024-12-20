import React, { useState } from 'react';
import { Calendar, Clock, Users, X } from 'lucide-react';

const EVENT_TYPES = [
  { id: 'BROTHERHOOD', label: 'Brotherhood', color: 'bg-green-100 text-green-800' },
  { id: 'MANDATORY', label: 'Mandatory', color: 'bg-red-300 text-red-800' },
  { id: 'SOCIAL', label: 'Social', color: 'bg-blue-100 text-blue-800' },
  { id: 'PHILANTHROPY', label: 'Philanthropy', color: 'bg-purple-100 text-purple-800' },
  { id: 'OTHER', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

export default function AddEventModal({ showModal, closeModal, orgId, addToast, setIsNewEvents }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    type: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Event Name is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.startTime) errors.startTime = 'Start Time is required';
    if (!formData.type) errors.type = 'Event Type is required';
    if (errors.length !== 0) {
      addToast('error', 'Please fill out required fields');
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent form submission if there are missing fields
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("jwtToken");
    const eventData = {
      name: formData.name,
      date: formData.date,
      startTime: formData.startTime,
      type: formData.type,
      location: formData.location,
      description: formData.description
    };

    try {
      const response = await fetch(`/api/organizations/${orgId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      addToast('success', data.message || 'Event created successfully!');
      setIsNewEvents(true);
      closeModal();
    } catch (err) {
      console.error('Error:', err);
      addToast('error', err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Fixed Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Add New Event</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  placeholder="Enter event name"
                />
                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Date
                    </div>
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full border ${formErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  />
                  {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Start Time
                    </div>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full border ${formErrors.startTime ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  />
                  {formErrors.startTime && <p className="text-red-500 text-sm">{formErrors.startTime}</p>}
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Event Type
                  </div>
                </label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.type ? 'border-red-500' : 'border-gray-300'} border-gray-300 rounded-md p-2`}
                >
                  <option value="">Select type...</option>
                  {EVENT_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                {formErrors.type && <p className="text-red-500 text-sm">{formErrors.type}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter event location"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter event description"
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Event Name</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="px-6 py-4">{formData.name || '-'}</td>
                      <td className="px-6 py-4">
                        {formData.date ? new Date(formData.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {formData.type && (
                          <span className={`${EVENT_TYPES.find(t => t.id === formData.type)?.color} text-xs font-medium px-2.5 py-0.5 rounded`}>
                            {EVENT_TYPES.find(t => t.id === formData.type)?.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="border-t p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}