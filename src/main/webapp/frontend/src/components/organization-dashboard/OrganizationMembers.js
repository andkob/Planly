import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Shield } from 'lucide-react';

const OrganizationMembers = ({ orgId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, [orgId]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`/api/org/get/members?orgId=${orgId}`, {
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
      console.log(JSON.stringify(data, null, 2));
      setMembers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
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
            <div className="text-sm text-gray-500">
              Joined {new Date(member.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrganizationMembers;