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
    setMembers(data);
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
      throw new Error('Failed to fetch joined organizations');
    }

    const organizations = data.map(org => ({
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch events');
    }
    const data = await response.json();
    setEvents(data);
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
    
    if (!response.ok) {
      throw new Error('Failed to fetch organization details');
    }

    const data = await response.json();
    setOrgDetails(data);
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
    setSchedules(currentSchedules => [...currentSchedules, data.schedule]);
    
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
    setSchedules(data);
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
          ? {...s, entries: scheduleEntries}
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
export async function fetchUserOrganizations(setMyOrganizations, addToast) {
  try {
    const response = await CallServer('/api/users/me/organizations', 'GET');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch joined organizations');
    }

    const organizations = data.map(org => ({
      id: org.id,
      name: org.name
    }));
    setMyOrganizations(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    addToast('error', error.message);
  }
}
