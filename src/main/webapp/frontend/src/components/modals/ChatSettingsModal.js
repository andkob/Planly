import React from 'react';
import { X, Trash2, Users } from 'lucide-react';
import { deleteChatRoom } from '../../util/EndpointManager';

export default function ChatSettingsModal({ isOpen, onClose, room, orgId, onUpdateRoom, onRoomDeleted, addToast }) {
  if (!isOpen) return null;

  const onDeleteRoom = async (roomId) => {
    const result = await deleteChatRoom(orgId, roomId);
    // here will be a toast with result.message or result.error
    if (!result.error) {
        onRoomDeleted(); // deselect room
        addToast('success', result.message);
    } else {
        addToast('error', result.error);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Chat Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Room Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                Room Name
              </label>
              <input
                type="text"
                id="roomName"
                value={room.name}
                onChange={(e) => onUpdateRoom({ ...room, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Settings Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Settings</h3>

            {/* Member Management */}
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Members</p>
                  <p className="text-xs text-gray-500">Manage chat room members</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{room.memberCount} members</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-medium text-red-600">Danger Zone</h3>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this chat room? This action cannot be undone.')) {
                  onDeleteRoom(room.id);
                }
              }}
              className="flex items-center gap-2 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-5 w-5" />
              <span className="text-sm font-medium">Delete Chat Room</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Save changes
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
