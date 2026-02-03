import axios from 'axios';

// Live server URL or fallback to localhost
//http://212.115.110.115:8080

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';


export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // safe for cookies / auth
});

api.interceptors.request.use(
  (config) => {
    // Example: attach token if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // 👈 IMPORTANT: return full AxiosResponse
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API ERROR]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('[API NO RESPONSE]', error.request);
    } else {
      console.error('[API SETUP ERROR]', error.message);
    }

    return Promise.reject(error);
  }
);
