import React, { useState } from 'react';
import { createChatRoom } from '../../util/EndpointManager';

export default function CreateChatRoomModal({ selectedOrg, showModal, closeModal }) {
  const [roomName, setRoomName] = useState('New Chat Room');

  const handleSubmit = async () => {
    const memberIds = [1, 2];
    const result = await createChatRoom(
      roomName,
      selectedOrg.id,
      'GROUP',
      memberIds
    );
    // TODO - handle 'result' if necessary
  }

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-hidden">
          <h3 className="text-lg font-medium mb-4">Create a New Chat</h3>         
          <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium">Chat Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            {/* TODO - Here should be a container showing members of the organization to add (also a select all button) */}
            <div className="divide-y divide-gray-200">
              {selectedOrg.members.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No members found</p>
              ) : (
                selectedOrg.members.map((member) => (
                  <p>{member.email}</p>
                ))
              )}
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
};