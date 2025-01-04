import React, { useEffect, useState, useRef } from 'react';
import { Send, Plus, Search, Users, Settings, ChevronDown } from 'lucide-react';
import { fetchChatRooms, sendMessage, markChatAsRead, fetchMessages, fetchAllUserOrganizationData } from '../../util/EndpointManager';
import CreateChatRoomModal from '../modals/CreateChatRoomModal';
import Message from './Message';

const ChatPage = () => {
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

  // modal
  const [showCreateChatRoomModal, setShowCreateChatRoomModal] = useState(false);
  const openCreateChatRoomModal  = () => setShowCreateChatRoomModal(true);
  const closeCreateChatRoomModal = () => setShowCreateChatRoomModal(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      loadChatRooms();
    }
  }, [selectedOrgId]);

  useEffect(() => {
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
    await fetchAllUserOrganizationData(setOrganizations);
  }

  const loadChatRooms = async () => {
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
  };

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

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    setSelectedOrgId(orgId);

    // Find the organization data matching this ID
    for (let i = 0; i < organizations.length; i++) {
      if (organizations[i].id == orgId) {
        console.log(organizations[i].id);
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

  const handleCreateRoom = async () => {
    if (!selectedOrgId) return;

    console.log('selected org: ', selectedOrg);
    openCreateChatRoomModal();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        {/* Organization Selector */}
        <div className="p-4 border-b">
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
              onClick={handleCreateRoom}
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
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="Chat Settings">
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

      {showCreateChatRoomModal && (
        <CreateChatRoomModal 
          selectedOrg={selectedOrg}
          showModal={showCreateChatRoomModal}
          closeModal={closeCreateChatRoomModal}
        />
      )}
    </div>
  );
};

export default ChatPage;