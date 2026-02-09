/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validatePackage,
  validatePrompt,
  validateEmail,
  validateURL,
  sanitizeFilename,
  validateFileSize,
  validateFileType,
} from '../validation.js';

describe('validation', () => {
  describe('validatePackage', () => {
    it('should validate valid package', () => {
      expect(() => validatePackage({
        name: 'Test Package',
        description: 'Test description',
        price: 10,
      })).not.toThrow();
    });

    it('should reject package without name', () => {
      expect(() => validatePackage({})).toThrow('Package name is required');
    });

    it('should reject package with name too long', () => {
      expect(() => validatePackage({
        name: 'a'.repeat(101),
      })).toThrow('Package name must be 100 characters or less');
    });

    it('should reject package with negative price', () => {
      expect(() => validatePackage({
        name: 'Test',
        price: -10,
      })).toThrow('Price must be a non-negative number');
    });
  });

  describe('validatePrompt', () => {
    it('should validate valid prompt', () => {
      expect(() => validatePrompt('test prompt')).not.toThrow();
    });

    it('should reject empty prompt', () => {
      expect(() => validatePrompt('')).toThrow('Prompt is required');
    });

    it('should reject prompt too long', () => {
      expect(() => validatePrompt('a'.repeat(10001))).toThrow('Prompt must be 10,000 characters or less');
    });
  });

  describe('validateEmail', () => {
    it('should validate valid email', () => {
      expect(() => validateEmail('test@example.com')).not.toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => validateEmail('invalid')).toThrow('Invalid email format');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filename', () => {
      expect(sanitizeFilename('test<>file.txt')).toBe('testfile.txt');
    });

    it('should handle empty filename', () => {
      expect(sanitizeFilename('')).toBe('file');
    });

    it('should remove path traversal', () => {
      expect(sanitizeFilename('../../file.txt')).toBe('file.txt');
    });
  });
});

