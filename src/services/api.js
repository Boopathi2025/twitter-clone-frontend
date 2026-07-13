import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT (if present) to every outgoing request. Since auth is fully
// stateless/token-based, this works identically on any device or browser -
// there's no server session to be "missing" on a fresh client.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear it and force a re-login rather than
// leaving the app in a broken half-authenticated state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const registerUser = (data) => api.post('/auth/register', data).then(r => r.data);
export const loginUser = (data) => api.post('/auth/login', data).then(r => r.data);

// ---- Users ----
export const getMe = () => api.get('/users/me').then(r => r.data);
export const getUserByUsername = (username) => api.get(`/users/username/${username}`).then(r => r.data);
export const searchUsers = (query) => api.get('/users/search', { params: { query } }).then(r => r.data);
export const updateProfile = (data) => api.put('/users/me', data).then(r => r.data);
export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/users/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

// ---- Tweets ----
export const getAllTweets = () => api.get('/tweets').then(r => r.data);
export const getMyFeed = () => api.get('/tweets/feed').then(r => r.data);
export const getTweetsByAuthor = (authorId) => api.get(`/tweets/user/${authorId}`).then(r => r.data);
export const createTweet = (content) => api.post('/tweets', { content }).then(r => r.data);
export const toggleLike = (tweetId) => api.post(`/tweets/${tweetId}/like`).then(r => r.data);
export const retweetTweet = (tweetId) => api.post(`/tweets/${tweetId}/retweet`).then(r => r.data);
export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`);

// ---- Replies ----
export const getReplies = (tweetId) => api.get(`/replies/tweet/${tweetId}`).then(r => r.data);
export const createReply = (tweetId, content) => api.post(`/replies/tweet/${tweetId}`, { content }).then(r => r.data);
export const deleteReply = (replyId) => api.delete(`/replies/${replyId}`);

export default api;
