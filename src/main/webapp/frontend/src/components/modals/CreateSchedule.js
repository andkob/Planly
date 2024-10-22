import React, { useState } from 'react';

function CreateSchedule({ showModal, closeModal }) {
  // const [spreadsheetId, setSpreadsheetId] = useState('');
  const [formId, setFormId] = useState(''); // For entering existing form ID

  // Handle form creation (could redirect to form creation page)
  const handleCreateNewForm = () => {
    // Redirect or logic to create a new form
    console.log("Redirecting to form creation page...");
    closeModal();
  };

  // Handle existing form ID submission
  const handleExistingFormSubmit = () => {
    if (!formId) {
      alert('Please enter a valid form ID');
      return;
    }
    // Logic for using existing form ID
    console.log("Using form ID:", formId);
    closeModal();
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create or Use Existing Form</h3>

            {/* Option to create new form */}
            <button
              onClick={handleCreateNewForm}
              className="w-full mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
            >
              Create New Response Form
            </button>

            {/* Option to use existing form */}
            <div className="mb-4">
              <input
                type="text"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="Enter Existing Form ID"
                className="pl-4 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleExistingFormSubmit}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
            >
              Submit Form ID
            </button>

            {/* Close modal */}
            <button
              onClick={closeModal}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateSchedule;
