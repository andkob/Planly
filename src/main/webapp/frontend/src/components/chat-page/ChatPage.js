import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Send, Plus, Search, Users, Settings, ChevronDown, ChevronLeft } from 'lucide-react';
import { fetchChatRooms, sendMessage, markChatAsRead, fetchMessages, fetchAllUserOrganizationData, fetchUserId } from '../../util/EndpointManager';
import CreateChatRoomModal from '../modals/CreateChatRoomModal';
import ChatSettingsModal from '../modals/ChatSettingsModal';
import Message from './Message';
import Toast from '../notification/Toast';

const ChatPage = () => {
  const [currentuserId, setCurrentUserId] = useState(-1); // only used for chat creation logic
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState([]); // org data for the selected ID
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // modals
  const [showCreateChatRoomModal, setShowCreateChatRoomModal] = useState(false);
  const openCreateChatRoomModal  = () => setShowCreateChatRoomModal(true);
  const closeCreateChatRoomModal = () => setShowCreateChatRoomModal(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // toast
  const [toasts, setToasts] = useState([]);
  const [toastCounter, setToastCounter] = useState(0);
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

  const loadChatRooms = useCallback(async () => {
    if (!selectedOrgId) return;

    setLoading(true);
    try {
      const rooms = await fetchChatRooms(selectedOrgId);
      if (!rooms.error) {
        setChatRooms(rooms);
      } else {
        setError(rooms.error);
      }
    } catch (err) {
      setError('Failed to load chat rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    loadOrganizations();
    fetchUserId(setCurrentUserId);
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      loadChatRooms();
    }
  }, [selectedOrgId, loadChatRooms]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedRoom?.id) return;
      
      try {
        const result = await fetchMessages(selectedRoom.id);
        if (result.error) {
          setError(result.error);
        } else {
          setMessages(result.content || []);
        }
      } catch (err) {
        setError('Failed to load messages');
        console.error(err);
      }
    };

    if (selectedRoom) {
      loadMessages();
    } else {
      setMessages([]); // Clear messages when room is deselected
    }
  }, [selectedRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadOrganizations = async () => {
    const data = await fetchAllUserOrganizationData(setOrganizations);
    if (data.content.length > 0) setSelectedOrgId(data.content[0].id); // set selected org to the first one
  }

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    setSelectedOrgId(orgId);

    // handle placeholder selector
    if (orgId === "") {
      setSelectedOrg([]);
      setSelectedRoom(null);
      setChatRooms([]);
      return;
    }

    // Find the organization data matching this ID
    for (let i = 0; i < organizations.length; i++) {
      if (organizations[i].id == orgId) { // TODO - not using === bc one of these is a string (compiler gives warning tho)
        setSelectedOrg(organizations[i]);
      }
    }
    setSelectedRoom(null);
  };

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    if (room.unreadMessages > 0) {
      try {
        await markChatAsRead(room.id);
        // Update chat rooms to reflect read status
        setChatRooms(rooms => 
          rooms.map(r => 
            r.id === room.id 
              ? { ...r, unreadMessages: 0 }
              : r
          )
        );
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedRoom) return;

    try {
      const result = await sendMessage(selectedRoom.id, messageContent);
      if (!result.error) {
        setMessageContent('');

        // Add the new message to the messages list
        const newMessage = {
          ...result.content,
          own: true
        };
        setMessages(prev => [...prev, newMessage]);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  const openCreateRoomModal = async () => {
    if (!selectedOrgId) return;
    openCreateChatRoomModal();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        {/* Organization Selector */}
        <div className="p-4 border-b">
          <button
            className="text-blue-600 mb-4"
            onClick={() => navigate("/dashboard")}
          >
            <span className="flex items-center space-x-4">
              <ChevronLeft />
              <span>Back to Dashboard</span>
            </span>
          </button> 
          <div className="relative">
            <select 
              className="w-full p-2 bg-white border rounded-lg appearance-none pr-10"
              onChange={handleOrgChange}
              value={selectedOrgId || ''}
            >
              <option value="">Select Organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
          </div>
        </div>

        {/* Search and New Chat */}
        <div className="p-4 border-b">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {selectedOrgId && (
            <button 
              onClick={openCreateRoomModal}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5" />
              New Chat
            </button>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            chatRooms.map(room => (
              <div
                key={room.id}
                onClick={() => handleRoomSelect(room)}
                className={`p-3 cursor-pointer hover:bg-gray-50 ${
                  selectedRoom?.id === room.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{room.name}</span>
                  {room.unreadMessages > 0 && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      {room.unreadMessages}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {room.memberCount} members
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedOrgId ? (
          <>
            {/* Chat Header */}
            {selectedRoom && (
              <div className="bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{selectedRoom.name}</h2>
                  <span className="text-sm text-gray-500">
                    {selectedRoom.memberCount} members
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="Manage Members">
                    <Users className="h-5 w-5 text-gray-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Chat Settings"
                    onClick={() => setIsSettingsModalOpen(true)}
                  >
                    <Settings className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}
              {messages.map(msg => (
                <Message key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
            </div>

            {/* Message Input */}
            {selectedRoom && (
              <div className="bg-white border-t p-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // No organization selected state
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h3 className="text-xl font-medium mb-2">Select an Organization</h3>
              <p>Choose an organization to view and participate in chat rooms</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateChatRoomModal && (
        <CreateChatRoomModal 
          selectedOrg={selectedOrg}
          currentUserId={currentuserId}
          showModal={showCreateChatRoomModal}
          closeModal={closeCreateChatRoomModal}
          reloadChats={() => {
            loadChatRooms();
          }}
          addToast={addToast}
        />
      )}

      {selectedRoom && (
        <ChatSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          room={selectedRoom}
          orgId={selectedOrgId}
          onUpdateRoom={() => {
            console.warn('Updating not currently supported')
          }}
          onRoomDeleted={() => {
            setSelectedRoom(null);
            loadChatRooms();
          }}
          addToast={addToast}
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
};

export default ChatPage;