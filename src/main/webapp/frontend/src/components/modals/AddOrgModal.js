

// THIS WILL BE DELETED


import React, { useState } from "react";

export default function AddOrgModal({ showModal, closeModal }) {
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const token = localStorage.getItem("jwtToken");
    fetch(`/api/org/post/new-org?orgName=${orgName}`, {
      method: "POST",
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add organization');
        }
        closeModal();
        return response.text();
      })
      .catch(err => {
        setError(err.message);
      });
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-hidden">
          <h3 className="text-lg font-medium mb-4">add org</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium">name it hoe</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}