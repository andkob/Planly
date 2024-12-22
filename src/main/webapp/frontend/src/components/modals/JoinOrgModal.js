import React, { useState } from "react";
import CallServer from "../../util/CallServer";

export default function JoinOrgModal({ showModal, closeModal, addToast }) {
  const [orgName, setOrgName] = useState('');
  const [matchingOrganizations, setMatchingOrganizations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    CallServer(`/api/organizations/${orgName}`, 'GET')
    .then(async response => {
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 409) { // CONFLICT
          addToast('info', errorText);
          return;
        }
        addToast('error', 'Failed to fetch organizations');
        throw new Error(errorText || 'Failed to fetch organizations');
      }
      return response.json();
    })
    .then(data => {
      if (data !== null) {
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        setMatchingOrganizations(data);
        if (data.length === 0) {
          addToast('info', 'No matching organizations found');
        } else {
          addToast('success', `Found ${data.length} matching organization(s)`);
        }
      }
    })
    .catch(err => {
      console.error(err.message);
      setError('An unexpected error occurred. Please try again.');
      addToast('error', 'Oops! Encountered an unexpected error.');
      setMatchingOrganizations([]);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const handleJoinOrg = (orgId, orgName) => {
    setLoading(true);
    const token = localStorage.getItem("jwtToken");
    
    CallServer(`/api/organizations/${orgId}/members`, 'POST')
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) { // Conflict
          console.warn("Hey so we got the conflict message"); // TODO - DELETE
          addToast('info', data.error);
        } else {
          console.error(data.error);
          addToast('error', data.error || 'Failed to join organization');
          setError(data.error);
        }
        return;
      }
      addToast('success', `Successfully joined ${orgName}`);
      closeModal();
    })
    .catch(err => {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
      addToast('error', 'An unexpected error occurred. Please try again.');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    showModal && (
      <>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-hidden">
            <h3 className="text-lg font-medium mb-4">Join an Organization</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium">Organization Name</label>
                <input
                  type="text"
                  placeholder="Search for an existing organization..."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              {matchingOrganizations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Matching Organizations</h4>
                  <div className="space-y-2">
                    {matchingOrganizations.map((org) => (
                      <div 
                        key={org.id} 
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <h5 className="font-medium">{org.name}</h5>
                          {org.description && (
                            <p className="text-sm text-gray-500">{org.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJoinOrg(org.id, org.name)}
                          disabled={loading}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50"
                        >
                          {loading ? 'Joining...' : 'Join'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    )
  );
}