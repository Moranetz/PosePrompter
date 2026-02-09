/**
 * Tests for useImageGeneration hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useImageGeneration } from '../useImageGeneration.js';

// Mock dependencies
vi.mock('../api/client.js', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../contexts/UserContext.jsx', () => ({
  useAuth: () => ({ user: { uid: 'test-user' } }),
}));

vi.mock('../utils/logger.js', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useImageGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useImageGeneration());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.generatedImages).toEqual([]);
    expect(result.current.generationHistory).toEqual([]);
  });

  it('should generate image successfully', async () => {
    const { default: apiClient } = await import('../api/client.js');
    apiClient.post.mockResolvedValue({
      data: {
        imageUrl: 'https://example.com/image.jpg',
        cost: 10,
        newBalance: 90,
      },
    });

    const { result } = renderHook(() => useImageGeneration());

    await result.current.generateImage({
      prompt: 'test prompt',
      model: 'flux',
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.generatedImages.length).toBeGreaterThan(0);
    expect(result.current.generationHistory.length).toBeGreaterThan(0);
  });

  it('should handle errors', async () => {
    const { default: apiClient } = await import('../api/client.js');
    apiClient.post.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useImageGeneration());

    await expect(
      result.current.generateImage({
        prompt: 'test prompt',
      })
    ).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});

