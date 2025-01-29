export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/validate`, {
      credentials: 'include'
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Auth validation error:', error);
    return false;
  }
}