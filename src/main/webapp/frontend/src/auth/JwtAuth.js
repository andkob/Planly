import { jwtDecode } from 'jwt-decode';

export const validateToken = (token) => {
    if (!token) return false;

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('jwtToken');
        return false;
      }

      return true;
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('jwtToken');
        return false;
    }
}