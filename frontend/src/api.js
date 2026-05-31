import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('inkwell_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auth
export const register = (data)        => api.post('/api/auth/register', data);
export const login    = (data)        => api.post('/api/auth/login', data);
export const getMe    = ()            => api.get('/api/auth/me');

// Posts
export const getPosts      = (params) => api.get('/api/posts', { params });
export const getPost       = (id)     => api.get(`/api/posts/${id}`);
export const createPost    = (data)   => api.post('/api/posts', data);
export const updatePost    = (id, d)  => api.put(`/api/posts/${id}`, d);
export const deletePost    = (id)     => api.delete(`/api/posts/${id}`);

// Comments
export const getComments   = (pid)    => api.get(`/api/posts/${pid}/comments`);
export const addComment    = (pid, d) => api.post(`/api/posts/${pid}/comments`, d);
export const deleteComment = (pid, cid) => api.delete(`/api/posts/${pid}/comments/${cid}`);

export default api;
