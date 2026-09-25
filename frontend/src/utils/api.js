/**
 * API configuration for LegalLens AI frontend.
 * Uses environment variable VITE_API_URL for the backend URL.
 * Falls back to relative URL in production (same-origin) or localhost in development.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Sanitizes text content to prevent XSS when rendering user/AI content.
 * Strips HTML tags and dangerous content.
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Formats file size from bytes to human-readable string.
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates a file for upload.
 * Returns { valid: boolean, error: string | null }
 */
export function validateFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' };

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  const VALID_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  const VALID_EXTENSIONS = ['.pdf', '.docx', '.txt'];

  const extension = '.' + file.name.split('.').pop().toLowerCase();
  const isValidType = VALID_TYPES.includes(file.type) || VALID_EXTENSIONS.includes(extension);

  if (!isValidType) {
    return { valid: false, error: `Unsupported file type "${extension}". Please upload a PDF, DOCX, or TXT file.` };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File size (${formatFileSize(file.size)}) exceeds the 10 MB limit.` };
  }
  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty.' };
  }

  return { valid: true, error: null };
}

/**
 * Returns the file type label from the file name or MIME type.
 */
export function getFileType(fileName) {
  if (!fileName) return 'Unknown';
  const ext = fileName.split('.').pop().toLowerCase();
  const map = { pdf: 'PDF', docx: 'DOCX', txt: 'TXT' };
  return map[ext] || ext.toUpperCase();
}

/**
 * Parses an API error response into a user-friendly message.
 * Never exposes raw stack traces or internal details.
 */
export function parseApiError(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';

  // Axios error with backend response
  if (err.response?.data?.error) {
    return err.response.data.error;
  }

  // Network error (backend unavailable, cold start, timeout)
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'The request timed out. The server may be starting up — please try again in a moment.';
  }
  if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
    return 'Unable to reach the server. Please check your connection or try again shortly.';
  }

  // HTTP status-based messages
  if (err.response) {
    const status = err.response.status;
    if (status === 413) return 'File too large. Please upload a smaller document.';
    if (status === 415) return 'Unsupported file format.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return 'The server encountered an error. Please try again later.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 403) return 'Access denied.';
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Generates a unique ID for local document tracking.
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Safely retrieves and parses JSON from localStorage.
 */
export function getFromStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

/**
 * Safely stores JSON in localStorage.
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e.message);
  }
}

/**
 * Removes a key from localStorage.
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // silently fail
  }
}

export default API_BASE_URL;
