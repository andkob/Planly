import CallServer from "./CallServer";

/**
 * Attempts to log a user in on the server. On success, navigates to the user's dashboard.
 * @param {json} formData JSON data contraining Identifier, Password
 * @param {function} setMessage Sets the message state.
 * @param {function} setIsAuthenticated Defined in App.js. Sets the isAuthenticated state in App.js.
 * @param {function} setIsSubmitting Sets the isSubmitting state in UserLogin.js
 * @param {function} navigate useNavigate function from react-router-dom
 */
export async function userLogin(formData, setMessage, setIsAuthenticated, setIsSubmitting, navigate) {
  setIsSubmitting(true);
  try {
    const response = await fetch('/api/auth/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('jwtToken', data.token);
      setMessage('Login successful');
      setIsAuthenticated(true);
      navigate('/dashboard');
    } else {
      setMessage(data.error || 'Login failed. Please check your credentials.');
    }
  } catch (error) {
    setMessage('An unexpected error occurred. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

/**
 * Registers a new user on the server. On success, navigates to the login page.
 * @param {json} registrationData JSON data containing Email, Username, Password
 * @param {function} setIsSubmitting Sets the isSubmitting state in Register.js
 * @param {function} setErrors Sets the error state in Register.js
 * @param {function} navigate useNavigate function from react-router-dom
 */
export async function userRegister(registrationData, setIsSubmitting, setErrors, navigate) {
  setIsSubmitting(true);
  try {
    const response = await fetch('/api/auth/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });
    const data = await response.json();

    if (response.ok) {
      navigate('/login');
    } else {
      setErrors(prev => ({
        ...prev,
        submit: data.error || 'Registration failed. Please try again.'
      }));
    }
  } catch (error) {
    setErrors(prev => ({
      ...prev,
      submit: 'An unexpected error occurred. Please try again.'
    }));
  } finally {
    setIsSubmitting(false);
  }
}

/**
 * Used in CreateOrgModal. Creates a new organization on the server.
 * @param {string}   orgName    The name of the new organization.
 * @param {function} saveOrg    Function defined in UserDashboard that updates local ownedOrganizations with this new one
 * @param {function} closeModal Function defined in UserDashboard that closes the CreateOrgModal
 * @param {function} addToast   Function defined in UserDashboard for notifications.
 * @param {function} setError   Sets the error state in CreateOrgModal.
 */
export async function createOrganization(orgName, saveOrg, closeModal, addToast, setError) {
  setError('');
  try {
    const response = await CallServer(`/api/organizations/new?orgName=${orgName}`, 'POST');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create organization');
    }
    saveOrg(data);
    closeModal();
    addToast('success', `Successfully created ${data.name}`);
  } catch (err) {
    console.error('Error:', err);
    setError(err.message);
    addToast('error', 'Failed to create organization');
  }
}

/**
 * Used in JoinOrgModal.js. Fetches organizations matching the query (orgName).
 * @param {string}   orgName    The name of the organization
 * @param {function} setLoading Sets the loading state
 * @param {function} setError   Sets the error state
 * @param {function} addToast   Function defined in UserDashboard. Adds a Toast notification.
 * @param {function} setMatchingOrganizations Sets the matchingOrganizations state. Used to display search results.
 */
export async function searchOrganizations(orgName, setLoading, setError, addToast, setMatchingOrganizations) {
  setLoading(true);
  setError('');

  CallServer(`/api/organizations/${orgName}`, 'GET')
    .then(async response => {
      if (!response.ok) {
        const errorText = await response.json().message;
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
      const organizations = data.content;
      if (organizations !== null) {
        if (!Array.isArray(organizations)) {
          throw new Error('Invalid response format');
        }

        setMatchingOrganizations(organizations);

        if (organizations.length === 0) {
          addToast('info', 'No matching organizations found');
        } else {
          addToast('success', `Found ${organizations.length} matching organization(s)`);
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
}

/**
 * Used in JoinOrgModal.js. Attempts to associate a user with an organization of specified id.
 * @param {BigInt} orgId The id of the organization to join
 * @param {string} orgName The name of the organization to join
 * @param {function} setLoading Sets the loading state
 * @param {function} addToast Adds a Toast notification
 * @param {function} setError Sets the error state
 * @param {function} closeModal Defined in UserDashboard. Closes the modal on success.
 */
export async function joinOrganization(orgId, orgName, setLoading, addToast, setError, closeModal) {
  setLoading(true);

  CallServer(`/api/organizations/${orgId}/members`, 'POST')
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) { // Conflict
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
}

/**
 * 
 * @param {*} orgId 
 * @param {*} eventData 
 * @param {*} addToast 
 * @param {*} setIsNewEvents 
 * @param {*} setLoading 
 * @param {*} closeModal 
 */
export async function postEvent(orgId, eventData, addToast, setIsNewEvents, setLoading, closeModal) {
  setLoading(true);
  try {
    const response = await CallServer(`/api/organizations/${orgId}/events`, 'POST', eventData);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create event');
    }

    addToast('success', data.message || 'Event created successfully!');
    setIsNewEvents(true);
    closeModal();
  } catch (err) {
    console.error('Error:', err);
    addToast('error', err.message || 'Failed to create event');
  } finally {
    setLoading(false);
  }
}

/**
 * 
 * @param {*} orgId 
 * @param {*} userId 
 * @param {*} fetchMembers 
 * @param {*} setConfirmDialog 
 * @param {*} addToast 
 */
export async function removeOrganizationMember(orgId, userId, fetchMembers, setConfirmDialog, addToast) {
  try {
    const response = await CallServer(`/api/organizations/${orgId}/members?userId=${userId}`, 'DELETE');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    fetchMembers(); // refresh list
    setConfirmDialog({ isOpen: false, userId: null, username: '' });
    addToast('success', data.message);
  } catch (error) {
    addToast('error', error.message || 'Failed to remove member');
  }
}

/**
 * 
 * @param {*} orgId 
 * @param {*} setMembers 
 * @param {*} setLoading 
 * @param {*} setError 
 */
export async function fetchOrganizationMembers(orgId, setMembers, setLoading, setError) {
  try {
    const response = await CallServer(`/api/organizations/${orgId}/members`, 'GET');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch member details');
    }
    setMembers(data.content);
    setLoading(false);
  } catch (err) {
    setError(err.message);
    setLoading(false);
  }
}

/**
 * TODO - I might ditch this functionality entirely
 * @param {*} setOwnedOrgs 
 * @param {*} setSelectedOrgId 
 * @param {*} addToast 
 */
export async function fetchIdsAndNames(setOwnedOrgs, setSelectedOrgId, addToast) {
  try {
    const response = await CallServer('/api/organizations/owned/id-name', 'GET');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch joined organizations');
    }

    const organizations = data.content.map(org => ({
      id: org.id,
      name: org.name
    }));

    if (organizations.length > 0) {
      setOwnedOrgs(organizations);
      setSelectedOrgId(organizations[0].id); // set selected org to first one
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
    addToast('error', error.message);
  }
}

/**
 * TODO - This is one that needs to be looked at due to the server return type.
 * @param {*} orgId 
 * @param {*} setLoading 
 * @param {*} setError 
 * @param {*} setIsNewEvents 
 */
export async function fetchOrganizationEvents(orgId, setLoading, setError, setEvents, setIsNewEvents) {
  setLoading(true);
  setError('');

  try {
    const response = await CallServer(`/api/organizations/${orgId}/events`, 'GET');

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch events');
    }
    setEvents(data.content);
  } catch (err) {
    console.error('Error fetching events:', err);
    setError(err.message || 'Failed to load events');
  } finally {
    setIsNewEvents(false);
    setLoading(false);
  }
}

/**
 * 
 * @param {*} orgId 
 * @param {*} setOrgDetails 
 * @param {*} addToast 
 */
export async function fetchOrganizationDetails(orgId, setOrgDetails, addToast) {
  try {
    const response = await CallServer(`/api/organizations/${orgId}/details`, 'GET');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch organization details');
    }

    setOrgDetails(data.content);
  } catch (error) {
    addToast('error', error.message);
  }
}

/**
 * 
 * @param {*} scheduleData 
 * @param {*} fetchSchedules 
 * @param {*} closeAddScheduleModal 
 */
export async function postNewSchedule(scheduleData, setSchedules, closeAddScheduleModal, addToast) {
  try {
    const response = await CallServer('/api/schedules', 'POST', scheduleData);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create schedule');
    }

    // Update list
    setSchedules(currentSchedules => [...currentSchedules, data.content]);

    closeAddScheduleModal();
    addToast('success', data.message);
  } catch (error) {
    console.error("An unexpected error occurred: " + error);
    addToast('error', error.message);
  }

}

/**
 * 
 * @param {*} setSchedules 
 */
export async function fetchUserSchedules(setSchedules) {
  try {
    const response = await CallServer('/api/schedules/entries/me', 'GET');
    const data = await response.json();
    setSchedules(data.content);
    return data;
  } catch (error) {
    console.error("Error fetching schedules: ", error);
  }
}

/**
 * 
 * @param {*} scheduleId 
 * @param {*} scheduleToUpdate 
 * @param {*} schedules 
 * @param {*} scheduleEntries 
 * @param {*} setSchedules 
 * @param {*} setOldScheduleEntries 
 * @param {*} addToast 
 */
export async function updateUserScheduleEntries(scheduleId, scheduleToUpdate, schedules, scheduleEntries, setSchedules, setOldScheduleEntries, addToast) {
  CallServer(`/api/schedules/${scheduleId}`, 'PUT', scheduleToUpdate)
    .then(response => {
      const data = response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to save changes.');

      return data.message;
    })
    .then((message) => {
      // Update local state with the modified schedule entries
      setSchedules(schedules.map(s =>
        s.id === scheduleId
          ? { ...s, entries: scheduleEntries }
          : s
      ));
      setOldScheduleEntries(scheduleEntries);
      addToast('success', message);
    })
    .catch((error) => {
      console.error("Error updating schedule", error);
      addToast('error', 'Failed to save changes. An unexpected error occurred.')
    });
}

/**
 * 
 * @param {*} setScheduleData 
 */
export async function fetchOrganizationMemberScheduleEntries(orgId, setScheduleData) {
  try {
    const response = await CallServer(`/api/schedules/entries/organization/${orgId}`, 'GET');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "An unexpected error occurred");
    }

    setScheduleData(data);
  } catch (error) {
    console.error('Error fetching schedule data:', error);
  }
}

/**
 * TODO - This also needs to be updated (should not use response.text())
 * @param {*} setName 
 */
export async function fetchUserFirstName(setName) {
  try {
    const response = await CallServer('/api/users/me/first-name', 'GET');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user name');
    }

    setName(data.message);
  } catch (err) {
    console.error('Error fetching user first name:', err);
  }
}

/**
 * TODO - same thing -> return type not good.
 * TODO - IdsNames should be combined into this function
 * @param {*} setMyOrganizations 
 * @param {*} addToast 
 */
export async function fetchUserOrganizations(setMyOrganizations, addToast = null) {
  try {
    const response = await CallServer('/api/users/me/organizations', 'GET');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch joined organizations');
    }

    const organizations = data.content.map(org => ({
      id: org.id,
      name: org.name
    }));
    setMyOrganizations(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    if (addToast) addToast('error', error.message);
  }
}

// =======================
// Chat Endpoint Functions
// =======================

// ChatEndpoints.js

// ChatEndpoints.js

/**
 * Fetches all chat rooms for the given organization
 * @param {number} orgId - The organization ID
 * @returns {Promise<{error?: string, content?: Array}>} Response containing chat rooms or error
 */
export const fetchChatRooms = async (orgId) => {
  try {
    const response = await CallServer(
      `/api/chat/rooms/organization/${orgId}`,
      'GET'
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch chat rooms' };
    }

    return data.content;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return { error: 'Failed to fetch chat rooms' };
  }
};

/**
 * Creates a new chat room
 * @param {string} name - Chat room name
 * @param {number} organizationId - Organization ID
 * @param {string} type - Chat room type (GROUP/ANNOUNCEMENT)
 * @returns {Promise<{error?: string, message?: string, content?: Object}>} Response containing created room or error
 */
export const createChatRoom = async (name, organizationId, type) => {
  try {
    const response = await CallServer(
      '/api/chat/rooms',
      'POST',
      { name, organizationId, type }
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to create chat room' };
    }

    return data; // Contains both message and content
  } catch (error) {
    console.error('Error creating chat room:', error);
    return { error: 'Failed to create chat room' };
  }
};

/**
 * Fetches messages for a specific chat room
 * @param {number} roomId - Chat room ID
 * @returns {Promise<{error?: string, content?: Array}>} Response containing messages or error
 */
export const fetchMessages = async (roomId) => {
  try {
    const response = await CallServer(
      `/api/chat/rooms/${roomId}/messages`,
      'GET'
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch messages' };
    }

    return { content: data.content };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { error: 'Failed to fetch messages' };
  }
};

/**
 * Sends a new message to a chat room
 * @param {number} roomId - Chat room ID
 * @param {string} content - Message content
 * @returns {Promise<{error?: string, message?: string, content?: Object}>} Response containing sent message or error
 */
export const sendMessage = async (roomId, content) => {
  try {
    const response = await CallServer(
      `/api/chat/rooms/${roomId}/messages`,
      'POST',
      { content }
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to send message' };
    }

    return data; // Contains both message and content
  } catch (error) {
    console.error('Error sending message:', error);
    return { error: 'Failed to send message' };
  }
};

/**
 * Adds members to a chat room based on organization role
 * @param {number} roomId - Chat room ID
 * @param {number} organizationId - Organization ID
 * @param {string} minimumRole - Minimum role required
 * @returns {Promise<{error?: string, message?: string}>} Response containing success message or error
 */
export const addChatMembers = async (roomId, organizationId, minimumRole) => {
  try {
    const response = await CallServer(
      `/api/chat/rooms/${roomId}/members`,
      'POST',
      { organizationId, minimumRole }
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to add members' };
    }

    return data; // Contains message
  } catch (error) {
    console.error('Error adding chat members:', error);
    return { error: 'Failed to add members' };
  }
};

/**
 * Removes a member from a chat room
 * @param {number} roomId - Chat room ID
 * @param {number} userId - User ID to remove
 * @returns {Promise<{error?: string, message?: string}>} Response containing success message or error
 */
export const removeChatMember = async (roomId, userId) => {
  try {
    const response = await CallServer(
      `/api/chat/rooms/${roomId}/members/${userId}`,
      'DELETE'
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to remove member' };
    }

    return data; // Contains message
  } catch (error) {
    console.error('Error removing chat member:', error);
    return { error: 'Failed to remove member' };
  }
};

/**
 * Marks all messages in a chat room as read
 * @param {number} roomId - Chat room ID
 * @returns {Promise<{error?: string, message?: string}>} Response containing success message or error
 */
export const markChatAsRead = async (roomId) => {
  try {
    const response = await CallServer(
      `/api/chat/rooms/${roomId}/mark-read`,
      'POST'
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to mark as read' };
    }

    return data; // Contains message
  } catch (error) {
    console.error('Error marking chat as read:', error);
    return { error: 'Failed to mark as read' };
  }
};

/**
 * Gets the count of unread messages in a chat room
 * @param {number} roomId - Chat room ID
 * @returns {Promise<{error?: string, content?: number}>} Response containing unread count or error
 */
export const getUnreadCount = async (roomId) => {
  try {
    const response = await CallServer(
      `/api/chat/rooms/${roomId}/unread-count`,
      'GET'
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get unread count' };
    }

    return { content: data.unreadCount };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { error: 'Failed to get unread count' };
  }
};