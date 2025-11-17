import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Auth API
export const authApi = {
  getCurrentUser: () => api.get('/auth/user'),
  register: (data) => api.post('/auth/register', data),
  loginWithPassword: (data) => api.post('/auth/login', data),
  loginWithProvider: (provider) => {
    window.location.href = `/api/auth/login/${provider}`
  },
  logout: () => api.post('/auth/logout')
}

// Charts API
export const chartsApi = {
  getAll: (params) => api.get('/charts', { params }),
  getById: (id) => api.get(`/charts/${id}`),
  create: (data) => api.post('/charts', data),
  update: (id, data) => api.put(`/charts/${id}`, data),
  delete: (id) => api.delete(`/charts/${id}`),
  search: (query) => api.get('/charts', { params: { search: query } })
}

// Votes API
export const votesApi = {
  vote: (chartId, voteType) => api.post(`/charts/${chartId}/votes`, { voteType }),
  removeVote: (chartId) => api.delete(`/charts/${chartId}/votes`)
}

// Comments API
export const commentsApi = {
  getAll: (chartId) => api.get(`/charts/${chartId}/comments`),
  create: (chartId, data) => api.post(`/charts/${chartId}/comments`, data),
  update: (chartId, commentId, data) => api.put(`/charts/${chartId}/comments/${commentId}`, data),
  delete: (chartId, commentId) => api.delete(`/charts/${chartId}/comments/${commentId}`)
}

// Feedback API
export const feedbackApi = {
  create: (data) => api.post('/feedback', data),
  getById: (id) => api.get(`/feedback/${id}`),
  getMine: () => api.get('/feedback/mine')
}

// Admin API
export const adminApi = {
  // User Management
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  assignRole: (id, roleName) => api.post(`/admin/users/${id}/assign-role`, { roleName }),
  removeRole: (id, roleName) => api.post(`/admin/users/${id}/remove-role`, { roleName }),
  resetPassword: (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, { newPassword }),
  lockUser: (id, lockoutEnd) => api.post(`/admin/users/${id}/lock`, { lockoutEnd }),
  unlockUser: (id) => api.post(`/admin/users/${id}/unlock`),

  // Feedback Management
  getAllFeedback: (params) => api.get('/admin/feedback', { params }),
  updateFeedback: (id, data) => api.put(`/admin/feedback/${id}`, data),
  deleteFeedback: (id) => api.delete(`/admin/feedback/${id}`),
  getFeedbackStats: () => api.get('/admin/feedback/stats')
}

// Add submitFeedback as a direct method on the default export for convenience
api.submitFeedback = feedbackApi.create

export default api
