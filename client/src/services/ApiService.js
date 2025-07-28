// src/services/ApiService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  getAuthToken() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
  }

  // Helper method for API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        
        // Handle specific error cases
        if (response.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to perform this action.');
        }
        
        if (response.status === 404) {
          throw new Error('Resource not found. Please check your request.');
        }
        
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // Enhanced error handling
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // Authentication endpoints
  async login(username, password) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username, phone, password) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, phone, password }),
    });
  }

  // Farmer endpoints
  async getFarmerDashboard() {
    return this.makeRequest('/farmer/dashboard');
  }

  async getDiseases() {
    return this.makeRequest('/farmer/diseases');
  }

  async submitSymptoms(symptoms) {
    return this.makeRequest('/farmer/diagnose', {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    });
  }

  async submitAnswers(answers) {
    return this.makeRequest('/farmer/answers', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getMyDiagnoses() {
    return this.makeRequest('/farmer/my-diagnoses');
  }

  async autoDiagnose(symptoms) {
    return this.makeRequest('/farmer/diagnose/auto', {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    });
  }

  // Engineer endpoints
  async getEngineerDashboard() {
    return this.makeRequest('/engineer/dashboard');
  }

  async addDiseaseWithQuestions(diseaseData) {
    return this.makeRequest('/engineer/diseases', {
      method: 'POST',
      body: JSON.stringify(diseaseData),
    });
  }

  // Manager endpoints
  async changeUserRole(userId, newRole) {
    return this.makeRequest('/manager/change-role', {
      method: 'PUT',
      body: JSON.stringify({ userId, newRole }),
    });
  }

  async getAllDiseasesWithEngineers() {
    return this.makeRequest('/manager/diseases');
  }

  async addDiseaseAsManager(diseaseData) {
    return this.makeRequest('/manager/add-disease', {
      method: 'POST',
      body: JSON.stringify(diseaseData),
    });
  }

  // IT Admin endpoints
  async getAllUsers() {
    return this.makeRequest('/it/users');
  }

  async updateUserRole(userId, newRole) {
    return this.makeRequest(`/it/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ newRole }),
    });
  }

  async deleteUser(userId) {
    return this.makeRequest(`/it/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // IT Admin: System monitoring
  async getSystemHealth() {
    return this.makeRequest('/it/system/health');
  }

  async getSystemLogs() {
    return this.makeRequest('/it/system/logs');
  }

  async createBackup() {
    return this.makeRequest('/it/system/backup', {
      method: 'POST',
    });
  }

  async restoreBackup() {
    return this.makeRequest('/it/system/restore', {
      method: 'POST',
    });
  }

  // IT Admin: Request handling
  async getFeedbackRequests() {
    return this.makeRequest('/it/requests/feedback');
  }

  async getSupportRequests() {
    return this.makeRequest('/it/requests/support');
  }

  // AI endpoints
  async getAiDiagnosis(symptoms) {
    return this.makeRequest('/ai/diagnose', {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    });
  }

  async getDiseaseSuggestions(query) {
    return this.makeRequest(`/ai/suggestions?query=${encodeURIComponent(query)}`);
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }

  // Disease CRUD endpoints
  async getAllDiseases() {
    return this.makeRequest('/diseases');
  }

  async getDiseaseById(id) {
    return this.makeRequest(`/diseases/${id}`);
  }

  async createDisease(data) {
    return this.makeRequest('/diseases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDisease(id, data) {
    return this.makeRequest(`/diseases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDisease(id) {
    return this.makeRequest(`/diseases/${id}`, {
      method: 'DELETE' });
  }

  // Farmer feedback
  async submitFeedback(message) {
    return this.makeRequest('/farmer/feedback', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Farmer support request
  async submitSupportRequest(subject, message) {
    return this.makeRequest('/farmer/support', {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    });
  }

  // Engineer: Questions management
  async getQuestionsForDisease(diseaseId) {
    return this.makeRequest(`/engineer/diseases/${diseaseId}/questions`);
  }

  // Manager: Questions management
  async getQuestionsForDiseaseAsManager(diseaseId) {
    return this.makeRequest(`/manager/diseases/${diseaseId}/questions`);
  }

  async addQuestionToDisease(diseaseId, text, answer = '') {
    return this.makeRequest(`/engineer/diseases/${diseaseId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ text, answer }),
    });
  }

  async updateQuestion(questionId, text, answer = '') {
    return this.makeRequest(`/engineer/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify({ text, answer }),
    });
  }

  async deleteQuestion(questionId) {
    return this.makeRequest(`/engineer/questions/${questionId}`, {
      method: 'DELETE' });
  }

  // Engineer: Submit for approval
  async submitChange(diseaseId) {
    return this.makeRequest('/engineer/submit-change', {
      method: 'POST',
      body: JSON.stringify({ diseaseId }),
    });
  }

  // Engineer: Submit disease edit for approval
  async submitDiseaseEdit(diseaseData) {
    return this.makeRequest('/engineer/submit-disease-edit', {
      method: 'POST',
      body: JSON.stringify(diseaseData),
    });
  }

  // Manager: Disease change management
  async getPendingDiseaseChanges() {
    return this.makeRequest('/manager/pending-changes');
  }

  async approveDiseaseChange(changeId) {
    return this.makeRequest(`/manager/approve/${changeId}`, {
      method: 'POST',
    });
  }

  async rejectDiseaseChange(changeId, reason) {
    return this.makeRequest(`/manager/reject/${changeId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Manager: Direct disease update (no approval needed)
  async updateDiseaseDirectly(diseaseData) {
    return this.makeRequest('/manager/update-disease', {
      method: 'POST',
      body: JSON.stringify(diseaseData),
    });
  }

  // Manager: Pending approvals
  async getPendingChanges() {
    return this.makeRequest('/manager/pending-changes');
  }
  async approveSubmission(id) {
    return this.makeRequest(`/manager/approve/${id}`, {
      method: 'POST',
    });
  }
  async rejectSubmission(id, reason) {
    return this.makeRequest(`/manager/reject/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Manager: Get users for role management
  async getUsersAsManager() {
    return this.makeRequest('/manager/users');
  }

  // Manager: Role change requests
  async getRoleRequests() {
    return this.makeRequest('/manager/role-requests');
  }
  async approveRoleRequest(id) {
    return this.makeRequest(`/manager/role-requests/${id}/approve`, {
      method: 'POST',
    });
  }
  async rejectRoleRequest(id, reason) {
    return this.makeRequest(`/manager/role-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // IT Admin: Questions management
  async getAllQuestions() {
    console.log('🔍 Calling getAllQuestions API...');
    const result = await this.makeRequest('/it/questions');
    console.log('🔍 getAllQuestions API result:', result);
    return result;
  }

  async addQuestionWithAnswer(questionData) {
    return this.makeRequest('/it/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  // IT Admin: Add new user
  async addUser(userData) {
    return this.makeRequest('/it/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
}

export default new ApiService(); 