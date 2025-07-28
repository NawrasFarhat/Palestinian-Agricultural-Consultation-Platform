// src/services/AuthService.js
import ApiService from './ApiService.js';

const AuthService = {
  async login(username, password) {
    try {
      const response = await ApiService.login(username, password);
      
      // Store user data with token
      const user = {
        username,
        role: response.role || 'farmer',
        token: response.token
      };
      
      localStorage.setItem("user", JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || "Invalid credentials" 
      };
    }
  },

  async signup(username, phone, password) {
    try {
      const response = await ApiService.register(username, phone, password);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout() {
    // Remove all authentication-related data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    
    // Clear any other potential auth data
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    
    // Force redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem("user");
      return null;
    }
  },

  isLoggedIn() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  },

  getToken() {
    const user = this.getCurrentUser();
    return user?.token;
  },

  // Helper method to check if token is expired
  isTokenExpired() {
    const user = this.getCurrentUser();
    if (!user || !user.token) return true;
    
    try {
      const payload = JSON.parse(atob(user.token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },

  // Auto logout if token is expired
  checkTokenExpiry() {
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }
    return true;
  }
};

export default AuthService;
