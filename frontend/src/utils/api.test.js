import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  validateFile, 
  parseApiError, 
  formatFileSize, 
  sanitizeText, 
  generateId,
  saveToStorage,
  getFromStorage,
  removeFromStorage
} from './api';

describe('API Utilities', () => {
  
  describe('sanitizeText', () => {
    it('removes HTML tags and prevents XSS', () => {
      const dangerous = '<script>alert("xss")</script>';
      const safe = sanitizeText(dangerous);
      expect(safe).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });
    
    it('handles empty input', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText('')).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('formats sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('validateFile', () => {
    it('rejects empty file selection', () => {
      const result = validateFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No file selected');
    });

    it('rejects files larger than 10MB', () => {
      const largeFile = new File([''], 'huge.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });
      const result = validateFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds the 10 MB limit');
    });

    it('rejects unsupported extensions and mimetypes', () => {
      const badFile = new File(['code'], 'script.js', { type: 'application/javascript' });
      const result = validateFile(badFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    it('accepts valid PDF files', () => {
      const goodFile = new File(['content'], 'contract.pdf', { type: 'application/pdf' });
      Object.defineProperty(goodFile, 'size', { value: 1024 });
      const result = validateFile(goodFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('parseApiError', () => {
    it('extracts backend error message', () => {
      const err = { response: { data: { error: 'Backend validation failed' } } };
      expect(parseApiError(err)).toBe('Backend validation failed');
    });

    it('handles network timeouts', () => {
      const err = { code: 'ECONNABORTED' };
      expect(parseApiError(err)).toContain('request timed out');
    });

    it('handles 413 Payload Too Large', () => {
      const err = { response: { status: 413 } };
      expect(parseApiError(err)).toContain('File too large');
    });
  });

  describe('localStorage Utils', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('saves and retrieves data correctly', () => {
      const testData = { id: generateId(), name: 'test' };
      saveToStorage('test_key', testData);
      
      const retrieved = getFromStorage('test_key');
      expect(retrieved).toEqual(testData);
    });

    it('removes data correctly', () => {
      saveToStorage('test_key', { a: 1 });
      removeFromStorage('test_key');
      expect(getFromStorage('test_key')).toBeNull();
    });
  });
});
