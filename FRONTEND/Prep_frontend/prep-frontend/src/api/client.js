import axios from 'axios';
import { API_BASE } from './config';
import { addAuthToken, handleResponseError } from './interceptors';

// Create the axios instance
const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add request interceptor
client.interceptors.request.use(addAuthToken);

// Add response interceptor
client.interceptors.response.use(
  (response) => response,
  handleResponseError
);

export default client;
