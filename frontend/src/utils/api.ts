import axios from 'axios';

const API_BASE_URL = 'https://d3kqhc83rnyttv.cloudfront.net/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;