import '@testing-library/jest-dom'

// Jest setup for form testing
import '@testing-library/jest-dom';

// Mock CSS parsing issues with @layer syntax
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress CSS parsing errors that are common in test environments
  if (
    args[0] &&
    typeof args[0] === 'object' &&
    args[0].type === 'css parsing' &&
    args[0].detail &&
    args[0].detail.includes('@layer')
  ) {
    return; // Suppress CSS @layer parsing errors in tests
  }
  
  // Suppress other known JSDOM CSS issues
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Could not parse CSS stylesheet') ||
     args[0].includes('Error: Could not parse CSS stylesheet'))
  ) {
    return;
  }
  
  originalConsoleError.apply(console, args);
};

// Mock DOM APIs that might not be available in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock File and FileList for upload testing
global.File = class File {
  constructor(bits, name, options) {
    this.bits = bits;
    this.name = name;
    this.size = options?.size || bits.join('').length;
    this.type = options?.type || '';
    this.lastModified = options?.lastModified || Date.now();
  }
};

global.FileList = class FileList {
  constructor(files = []) {
    Object.assign(this, files);
    this.length = files.length;
  }
  
  item(index) {
    return this[index] || null;
  }
  
  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock performance API
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
};

// Mock crypto for secure operations
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Enhanced error handling for async operations
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Set up default timeout for tests
jest.setTimeout(30000);

// Global test utilities
global.createMockFile = (name, type, size = 1024) => {
  const file = new File(['mock content'], name, { type, size });
  return file;
};

global.waitFor = (callback, options = {}) => {
  const { timeout = 5000, interval = 50 } = options;
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
          return;
        }
      } catch (error) {
        // Continue checking
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error('waitFor timeout'));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
};

// Suppress console warnings in tests
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
}); 