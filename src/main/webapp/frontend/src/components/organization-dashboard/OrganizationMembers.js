import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Mail, MoreVertical, UserCog, UserMinus } from 'lucide-react';
import ConfirmDialog from './menus/ConfirmDialog';

const OrganizationMembers = ({ orgId, addToast }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, userId: null, username: '' });
  const menuRef = useRef(null);

  useEffect(() => {
    fetchMembers();
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [orgId]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch member details');
      }
      const data = await response.json();
      setMembers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChangeRole = (userId) => {
    // TODO: Implement role change logic
    console.log('Change role for user:', userId);
    setOpenMenuId(null);
  };

  const handleRemoveClick = (userId, username) => {
    setConfirmDialog({ isOpen: true, userId, username });
    setOpenMenuId(null);
  };

  const handleRemoveMember = async () => {
    const userId = confirmDialog.userId;
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`/api/organizations/${orgId}/members?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      fetchMembers(); // refresh list
      setConfirmDialog({ isOpen: false, userId: null, username: '' });
      addToast('success', message);
    } catch (error) {
      addToast('error', error.message || 'Failed to remove member');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'MEMBER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error loading members: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-200">
        {members.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No members found</p>
        ) : (
          members.map((member) => (
            <div key={member.userId} className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <UserCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{member.username}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {member.role.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </div>
                {member.role !== 'OWNER' && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === member.userId ? null : member.userId)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </button>
                    
                    {openMenuId === member.userId && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu">
                          <button
                            onClick={() => handleChangeRole(member.userId)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Change Role
                          </button>
                          <button
                            onClick={() => handleRemoveClick(member.userId, member.username)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove Member
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, userId: null, username: '' })}
        onConfirm={handleRemoveMember}
        username={confirmDialog.username}
      />
    </>
  );
};

export default OrganizationMembers;