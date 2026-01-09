import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8280/api/v1", 
  withCredentials: false,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
    
    }
    return Promise.reject(error);
  }
);
