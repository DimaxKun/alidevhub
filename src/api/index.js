import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

// Auth
export const register = (data) => api.post('/users/register', data)
export const login = (data) => api.post('/users/login', data)
export const getProfile = () => api.get('/users/details')

// Posts
export const getPosts = () => api.get('/posts/getPosts')
export const getPost = (id) => api.get(`/posts/getPost/${id}`)
export const addPost = (data) => api.post('/posts/addPost', data)
export const updatePost = (id, data) => api.patch(`/posts/updatePost/${id}`, data)
export const deletePost = (id) => api.delete(`/posts/deletePost/${id}`)

// Comments
export const getComments = (postId) => api.get(`/posts/getComments/${postId}`)
export const addComment = (postId, comment) => api.patch(`/posts/addComment/${postId}`, { comment })
export const deleteComment = (postId, commentId) => api.delete(`/posts/deleteComment/${postId}/${commentId}`)
