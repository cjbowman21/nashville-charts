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

// Add submitFeedback as a direct method on the default export for convenience
api.submitFeedback = feedbackApi.create

export default api
