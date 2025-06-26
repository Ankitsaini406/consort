import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock context providers with minimal setup
jest.mock('@/context/userContext', () => ({
  useUser: () => ({
    user: { 
      name: 'Test User',
      email: 'test@example.com',
      uid: 'test-uid'
    },
    isLoading: false,
  }),
}));

jest.mock('@/context/TagContext', () => ({
  useTags: () => ({
    globalTags: [
      { value: 'tag1', label: 'Tag 1' },
      { value: 'tag2', label: 'Tag 2' },
    ],
    productBrands: [
      { value: 'brand1', label: 'Brand 1' },
      { value: 'brand2', label: 'Brand 2' },
    ],
    clients: [
      { value: 'client1', label: 'Client 1' },
      { value: 'client2', label: 'Client 2' },
    ],
    industries: [
      { value: 'industry1', label: 'Industry 1' },
      { value: 'industry2', label: 'Industry 2' },
    ],
    loading: false,
    error: null,
  }),
}));

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Add global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 