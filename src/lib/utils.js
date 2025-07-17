import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { API_BASE_URL } from '../config';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- API UTILS ---

/**
 * A wrapper around axios for making API requests.
 * @param {string} method - The HTTP method (get, post, put, delete).
 * @param {string} endpoint - The API endpoint (e.g., '/tickets/Open').
 * @param {object} [data=null] - The request payload for POST/PUT requests.
 * @param {string} [token=null] - The JWT token for authorization.
 * @returns {Promise<object>} - The data from the API response.
 * @throws {Error} - Throws an error if the API request fails.
 */
export const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }

    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      ...config,
    });

    return response.data;
  } catch (error) {
    // Log the detailed error for debugging
    console.error(`API Request Failed: ${method.toUpperCase()} ${endpoint}`, error.response || error.message);

    // Construct a more informative error message
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
    
    // You can decide to throw a new error or return a specific error structure
    throw new Error(errorMessage);
  }
};

// --- DATE/TIME UTILS ---

/**
 * Formats a date string or Date object into a more readable format.
 * @param {string | Date} dateInput - The date to format.
 * @param {object} [options] - Intl.DateTimeFormat options.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
};

// --- OTHER UTILS ---

/**
 * A simple debounce function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};