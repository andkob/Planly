import React, { useState } from 'react';
import { createChatRoom } from '../../util/EndpointManager';
import { Check, Square } from 'lucide-react';

export default function CreateChatRoomModal({ selectedOrg, currentUserId, showModal, closeModal, reloadChats, addToast }) {
  const [roomName, setRoomName] = useState('New Chat Room');
  const [selectedMembers, setSelectedMembers] = useState(new Set([currentUserId]));
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers(new Set([currentUserId]));
    } else {
      const allMemberIds = selectedOrg.members.map(member => member.id);
      setSelectedMembers(new Set(allMemberIds));
    }
    setSelectAll(!selectAll);
  };

  const toggleMember = (memberId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
      setSelectAll(false);
    } else {
      newSelected.add(memberId);
      if (newSelected.size === selectedOrg.members.length) {
        setSelectAll(true);
      }
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMembers.size === 0) {
      addToast('error', 'Please select at least one member');
      return;
    }

    const result = await createChatRoom(
      roomName,
      selectedOrg.id,
      'GROUP',
      Array.from(selectedMembers)
    );
    
    if (!result.error) {
      addToast('success', result.message);
      reloadChats();
    } else {
      addToast('error', result.error);
    }
    closeModal();
  };

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

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Select Members</label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="border rounded-md divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {selectedOrg.members.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No members found</p>
                ) : (
                  selectedOrg.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => member.id !== currentUserId && toggleMember(member.id)}
                    >
                      <div className="mr-3">
                        {selectedMembers.has(member.id) ? (
                          <div className="w-5 h-5 bg-indigo-600 text-white flex items-center justify-center rounded">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {member.username}
                          <span className='text-sm text-indigo-600'>{member.id === currentUserId && " (you)"}</span>
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedMembers.size > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} selected
                </p>
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
}