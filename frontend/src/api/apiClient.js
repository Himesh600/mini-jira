import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://mini-jira-backend-k2d0.onrender.com/',
});

// This automatically intercepts every request and adds the token!
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;