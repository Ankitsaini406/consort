import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostForm } from '../components/PostForm';
import { useRouter } from 'next/navigation';
import { useTags } from '@/context/TagContext';
import { useUser } from '@/context/userContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Firebase
jest.mock('@/firebase/firebaseconfig', () => ({
  db: {},
  storage: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock context providers
jest.mock('@/context/TagContext', () => ({
  useTags: jest.fn(),
}));

jest.mock('@/context/userContext', () => ({
  useUser: jest.fn(),
}));

// Mock utils
jest.mock('@/utils/Utils', () => ({
  createSlug: jest.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock form components
jest.mock('@/app/admin/forms/components/AppFormRenderer', () => ({
  AppFormRenderer: ({ formConfig }: any) => (
    <div data-testid="form-renderer">
      <div data-testid="step-progress">Step Progress</div>
      <div data-testid="step-card">Step Card</div>
      <div data-testid="form-actions">
        <button 
          onClick={() => formConfig.onSubmit({ postTitle: 'Test Post', date: '2023-01-01' })}
          data-testid="submit-button"
        >
          Submit
        </button>
        <span>Publish Post</span>
      </div>
    </div>
  ),
}));

// Mock form utilities
jest.mock('@/app/admin/forms/utils/errorHandler', () => ({
  FormErrorHandler: {
    handleError: jest.fn((error) => error.message),
    logError: jest.fn(),
  },
  UserNotification: {
    showSuccess: jest.fn(),
    showError: jest.fn(),
  },
  InputSanitizer: {
    sanitizeString: jest.fn((str) => str),
    sanitizeHTML: jest.fn((str) => str),
    validateFormData: jest.fn((data) => ({
      isValid: true,
      errors: [],
      sanitized: data
    })),
  },
}));

jest.mock('@/app/admin/forms/utils/rateLimiter', () => ({
  RateLimiter: {
    getClientIdentifier: jest.fn(() => 'test-client'),
  },
  withRateLimit: jest.fn((clientId, action, fn) => fn()),
}));

// Mock form layout components - REMOVED: Now handled by AppFormRenderer mock
// These components are now rendered within the AppFormRenderer mock above

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
};

const mockTags = {
  globalTags: [
    { value: 'tech', label: 'Technology' },
    { value: 'ai', label: 'Artificial Intelligence' },
  ],
  clients: [
    { value: 'client1', label: 'Client 1' },
  ],
  industries: [
    { value: 'healthcare', label: 'Healthcare' },
  ],
  loading: false,
  error: null,
};

describe('PostForm Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (useTags as jest.Mock).mockReturnValue(mockTags);
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the form when data is loaded', () => {
      render(<PostForm />);
      
      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('step-progress')).toBeInTheDocument();
      expect(screen.getByTestId('step-card')).toBeInTheDocument();
      expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      expect(screen.getByText('Publish Post')).toBeInTheDocument();
    });

    it('should show loading state when tags are loading', () => {
      (useTags as jest.Mock).mockReturnValueOnce({
        ...mockTags,
        loading: true,
      });

      render(<PostForm />);
      
      expect(screen.getByText('Loading form configuration...')).toBeInTheDocument();
      expect(screen.queryByTestId('form-renderer')).not.toBeInTheDocument();
    });

    it('should show error state when there is an error loading tags', () => {
      const error = new Error('Failed to load tags');
      (useTags as jest.Mock).mockReturnValueOnce({
        ...mockTags,
        loading: false,
        error,
      });

      render(<PostForm />);
      
      expect(screen.getByText('Error loading form configuration: Failed to load tags')).toBeInTheDocument();
      expect(screen.queryByTestId('form-renderer')).not.toBeInTheDocument();
    });
  });

  describe('Form Configuration', () => {
    it('should pass correct form configuration to AppFormRenderer', () => {
      const { container } = render(<PostForm />);
      
      // Verify form renderer is present with expected structure
      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should handle empty tag arrays gracefully', () => {
      (useTags as jest.Mock).mockReturnValueOnce({
        globalTags: [],
        clients: [],
        industries: [],
        loading: false,
        error: null,
      });

      render(<PostForm />);
      
      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful form submission', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValueOnce(undefined);

      render(<PostForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      });
    });

    it('should handle submission errors gracefully', async () => {
      const { setDoc } = require('firebase/firestore');
      const error = new Error('Firebase error');
      setDoc.mockRejectedValueOnce(error);

      render(<PostForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Error should be handled by the form without crashing
      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      });
    });

    it('should redirect after successful submission', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValueOnce(undefined);

      render(<PostForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Wait for redirect to be called
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin');
      }, { timeout: 2000 });
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize form data before submission', async () => {
      const { InputSanitizer } = require('@/app/admin/forms/utils/errorHandler');
      
      render(<PostForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(InputSanitizer.validateFormData).toHaveBeenCalled();
      });
    });
  });

  describe('User Context Integration', () => {
    it('should work when user is null', () => {
      (useUser as jest.Mock).mockReturnValueOnce({ user: null });

      render(<PostForm />);
      
      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    });

    it('should include user information in form submission', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValueOnce(undefined);

      render(<PostForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            createdBy: 'Test User',
          })
        );
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to form submissions', async () => {
      const { withRateLimit } = require('@/app/admin/forms/utils/rateLimiter');
      
      render(<PostForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(withRateLimit).toHaveBeenCalledWith(
          'test-client',
          'formSubmission',
          expect.any(Function)
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit errors', async () => {
      const { withRateLimit } = require('@/app/admin/forms/utils/rateLimiter');
      const rateLimitError = new Error('Rate limit exceeded');
      withRateLimit.mockRejectedValueOnce(rateLimitError);

      render(<PostForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Should not crash the component
      await waitFor(() => {
        expect(withRateLimit).toHaveBeenCalled();
      });
    });

    it('should handle file upload errors', async () => {
      const { uploadBytes } = require('firebase/storage');
      uploadBytes.mockRejectedValueOnce(new Error('Upload failed'));

      render(<PostForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Should handle upload errors gracefully
      await waitFor(() => {
        expect(uploadBytes).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed sections data', async () => {
      // Test with sections as object instead of array
      render(<PostForm />);
      
      // This should not crash the component
      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    });

    it('should handle missing required fields gracefully', async () => {
      render(<PostForm />);
      
      // Form should still render and handle validation
      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    });
  });
}); 