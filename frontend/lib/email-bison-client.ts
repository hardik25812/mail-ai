import axios from 'axios';

const EMAIL_BISON_API_URL = 'http://localhost:4001/api';

const emailBisonClient = axios.create({
  baseURL: EMAIL_BISON_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle common errors
emailBisonClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Email Bison API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default emailBisonClient;
