const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper for making authenticated HTTP requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('evalhub_token');
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getCurrentUser: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' })
  },

  // Student Endpoints
  students: {
    getDashboard: () => request('/students/dashboard/stats'),
    getAll: () => request('/students'),
    getById: (id) => request(`/students/${id}`)
  },

  // Faculty Endpoints
  faculty: {
    getDashboard: () => request('/faculty/dashboard/stats'),
    getAll: () => request('/faculty'),
    getById: (id) => request(`/faculty/${id}`)
  },

  // Admin Endpoints
  admin: {
    getDashboard: () => request('/admin/dashboard'),
    getUsers: () => request('/admin/users'),
    createUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' })
  },

  // Assignments
  assignments: {
    getAll: () => request('/assignments'),
    getById: (id) => request(`/assignments/${id}`),
    create: (assignmentData) => request('/assignments', { method: 'POST', body: JSON.stringify(assignmentData) }),
    update: (id, data) => request(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/assignments/${id}`, { method: 'DELETE' })
  },

  // Submissions
  submissions: {
    submit: (formData) => request('/submissions', { method: 'POST', body: formData }),
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/submissions${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/submissions/${id}`),
    delete: (id) => request(`/submissions/${id}`, { method: 'DELETE' })
  },

  // Evaluation
  evaluation: {
    trigger: (submissionId) => request(`/evaluation/${submissionId}`, { method: 'POST' }),
    get: (submissionId) => request(`/evaluation/${submissionId}`)
  },

  // Plagiarism Detection
  plagiarism: {
    getBySubmission: (submissionId) => request(`/plagiarism/${submissionId}`),
    getAssignmentHub: (assignmentId) => request(`/plagiarism/assignment/${assignmentId}`)
  },

  // Feedback
  feedback: {
    submit: (data) => request('/feedback', { method: 'POST', body: JSON.stringify(data) }),
    getBySubmission: (submissionId) => request(`/feedback/${submissionId}`)
  },

  // Reports
  reports: {
    getBySubmission: (submissionId) => request(`/reports/${submissionId}`)
  }
};
