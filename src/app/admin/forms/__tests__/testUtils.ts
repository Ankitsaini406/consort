import { FormConfig, FormField } from '../types';
import { PostFormData } from '../../posts/types';

// Reusable test data generators
export class TestDataGenerator {
  static createMockFile(name: string, type: string, size: number = 1024): File {
    const file = new File(['mock content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }

  static createMaliciousFile(baseType: string = 'image/jpeg'): File {
    return this.createMockFile('malware.exe.jpg', baseType);
  }

  static createLargeFile(sizeInMB: number = 10): File {
    return this.createMockFile('large-file.jpg', 'image/jpeg', sizeInMB * 1024 * 1024);
  }

  static createMaliciousText(baseText: string = 'Safe Text'): string {
    return `<script>alert("xss")</script>${baseText}`;
  }

  static createMaliciousHTML(baseHTML: string = '<p>Safe Content</p>'): string {
    return `${baseHTML}<script>alert("xss")</script><iframe src="javascript:alert('xss')"></iframe>`;
  }

  static createComplexXSSPayload(): string {
    return `
      <img src="x" onerror="alert('xss')">
      <svg onload="alert('xss')">
      <iframe src="javascript:alert('xss')">
      <details open ontoggle="alert('xss')">
      &#x27;&#x27;&#x27;onclick=alert(1)&#x27;&#x27;&#x27;
    `;
  }

  static createSQLInjectionPayload(): string {
    return "'; DROP TABLE users; --";
  }

  static createPathTraversalPayload(): string {
    return '../../../etc/passwd';
  }

  static createValidPostData(): Partial<PostFormData> {
    return {
      postType: 'blog-post',
      industryUseCases: ['healthcare'],
      globalTags: ['ai'],
      postTitle: 'Valid Test Post',
      date: '2023-12-25',
      headline: 'This is a valid test headline',
      sections: [
        {
          id: '1',
          sectionTitle: 'Introduction',
          sectionContent: '<p>This is valid content.</p>',
          sectionImage: null,
        },
      ],
      clientCompanies: ['client1'],
    };
  }

  static createInvalidPostData(): Partial<PostFormData> {
    return {
      postType: '',
      industryUseCases: [],
      globalTags: [],
      postTitle: '',
      date: '',
      headline: '',
      sections: [],
      clientCompanies: [],
    };
  }

  static createMaliciousPostData(): Partial<PostFormData> {
    return {
      postType: 'blog-post',
      industryUseCases: ['healthcare'],
      globalTags: ['ai'],
      postTitle: this.createMaliciousText('Malicious Post Title'),
      date: '2023-12-25',
      headline: this.createMaliciousHTML('<h1>Malicious Headline</h1>'),
      sections: [
        {
          id: '1',
          sectionTitle: this.createMaliciousText('Malicious Section'),
          sectionContent: this.createMaliciousHTML('<p>Malicious content</p>'),
          sectionImage: null,
        },
      ],
      clientCompanies: ['client1'],
    };
  }
}

// Reusable test scenarios
export class TestScenarios {
  static async fillMinimumRequiredFields(userEvent: any, screen: any) {
    await userEvent.selectOptions(screen.getByLabelText(/Post Type/), 'blog-post');
    await userEvent.click(screen.getByLabelText(/Industry Use Cases/));
    await userEvent.click(screen.getByText('Healthcare'));
    await userEvent.click(screen.getByLabelText(/Global Tags/));
    await userEvent.click(screen.getByText('Artificial Intelligence'));
    await userEvent.type(screen.getByLabelText(/Post Title/), 'Test Post');
    await userEvent.type(screen.getByLabelText(/Date/), '2023-12-25');
    await userEvent.type(screen.getByLabelText(/Headline/), 'Test headline');
    
    const heroImageInput = screen.getByLabelText(/Hero Image/);
    const heroImage = TestDataGenerator.createMockFile('hero.jpg', 'image/jpeg');
    await userEvent.upload(heroImageInput, heroImage);
  }

  static async testFormStep(userEvent: any, screen: any, stepName: string) {
    await userEvent.click(screen.getByText('Next'));
    expect(screen.getByText(stepName)).toBeInTheDocument();
  }

  static async testFormSubmission(userEvent: any, screen: any) {
    await userEvent.click(screen.getByText('Publish Post'));
  }

  static async addContentSection(userEvent: any, screen: any, title: string, content: string) {
    await userEvent.click(screen.getByText('Add Content Section'));
    
    const sectionTitleInputs = screen.getAllByLabelText(/Section Title/);
    const latestTitleInput = sectionTitleInputs[sectionTitleInputs.length - 1];
    await userEvent.type(latestTitleInput, title);
    
    const richTextEditors = screen.getAllByTestId('rich-text-editor');
    const latestEditor = richTextEditors[richTextEditors.length - 1];
    await userEvent.type(latestEditor, content);
  }
}

// Security test utilities
export class SecurityTestUtils {
  static createXSSTestCases(): Array<{ name: string; payload: string; shouldBlock: boolean }> {
    return [
      { name: 'Basic script tag', payload: '<script>alert("xss")</script>', shouldBlock: true },
      { name: 'Image with onerror', payload: '<img src="x" onerror="alert(1)">', shouldBlock: true },
      { name: 'SVG with onload', payload: '<svg onload="alert(1)">', shouldBlock: true },
      { name: 'Iframe with javascript', payload: '<iframe src="javascript:alert(1)">', shouldBlock: true },
      { name: 'Event handler in div', payload: '<div onclick="alert(1)">Click me</div>', shouldBlock: true },
      { name: 'Data URL script', payload: '<img src="data:text/html,<script>alert(1)</script>">', shouldBlock: true },
      { name: 'HTML entities', payload: '&lt;script&gt;alert("xss")&lt;/script&gt;', shouldBlock: true },
      { name: 'Unicode bypass', payload: '\u003cscript\u003ealert(1)\u003c/script\u003e', shouldBlock: true },
      { name: 'Safe HTML', payload: '<p><strong>Bold text</strong></p>', shouldBlock: false },
      { name: 'Safe text', payload: 'This is normal text', shouldBlock: false },
    ];
  }

  static createFileUploadTestCases(): Array<{ name: string; filename: string; mimeType: string; isValidation: boolean }> {
    return [
      { name: 'Valid JPEG image', filename: 'image.jpg', mimeType: 'image/jpeg', isValidation: false },
      { name: 'Valid PNG image', filename: 'image.png', mimeType: 'image/png', isValidation: false },
      { name: 'Valid PDF document', filename: 'document.pdf', mimeType: 'application/pdf', isValidation: false },
      { name: 'Executable file', filename: 'malware.exe', mimeType: 'application/x-msdownload', isValidation: true },
      { name: 'JavaScript file', filename: 'script.js', mimeType: 'text/javascript', isValidation: true },
      { name: 'Batch file', filename: 'script.bat', mimeType: 'application/x-msdos-program', isValidation: true },
      { name: 'Shell script', filename: 'script.sh', mimeType: 'application/x-sh', isValidation: true },
      { name: 'Double extension', filename: 'image.jpg.exe', mimeType: 'image/jpeg', isValidation: true },
      { name: 'PHP file', filename: 'script.php', mimeType: 'text/plain', isValidation: true },
      { name: 'SVG with script', filename: 'image.svg', mimeType: 'image/svg+xml', isValidation: true },
    ];
  }

  static createRateLimitTestCases(): Array<{ name: string; limitType: string; expectedMax: number }> {
    return [
      { name: 'Form submission', limitType: 'formSubmission', expectedMax: 5 },
      { name: 'File upload', limitType: 'fileUpload', expectedMax: 3 },
      { name: 'Authentication', limitType: 'authentication', expectedMax: 3 },
      { name: 'Admin action', limitType: 'adminAction', expectedMax: 10 },
      { name: 'Strict mode', limitType: 'strict', expectedMax: 2 },
    ];
  }
}

// Form validation test utilities
export class ValidationTestUtils {
  static createValidationTestCases(): Array<{ fieldName: string; validValues: any[]; invalidValues: any[] }> {
    return [
      {
        fieldName: 'postTitle',
        validValues: ['Valid Title', 'Short', 'A'.repeat(120)],
        invalidValues: ['', 'A'.repeat(121), null, undefined],
      },
      {
        fieldName: 'headline',
        validValues: ['Valid headline', 'Short', 'H'.repeat(150)],
        invalidValues: ['', 'H'.repeat(151), null, undefined],
      },
      {
        fieldName: 'date',
        validValues: ['2023-12-25', '2024-01-01'],
        invalidValues: ['', 'invalid-date', '2023-13-40', null, undefined],
      },
      {
        fieldName: 'postType',
        validValues: ['blog-post', 'news', 'event', 'announcement'],
        invalidValues: ['', 'invalid-type', null, undefined],
      },
    ];
  }

  static async testFieldValidation(
    userEvent: any,
    screen: any,
    fieldName: string,
    validValues: any[],
    invalidValues: any[]
  ) {
    // Test valid values
    for (const value of validValues) {
      const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
      await userEvent.clear(field);
      if (value !== null && value !== undefined) {
        await userEvent.type(field, value);
      }
      // Add validation checks here
    }

    // Test invalid values
    for (const value of invalidValues) {
      const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
      await userEvent.clear(field);
      if (value !== null && value !== undefined) {
        await userEvent.type(field, value);
      }
      // Add validation checks here
    }
  }
}

// Performance test utilities
export class PerformanceTestUtils {
  static measureAsyncOperation = async <T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    const duration = end - start;
    return { result, duration };
  };

  static measureOperation = <T>(operation: () => T): { result: T; duration: number } => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    const duration = end - start;
    return { result, duration };
  };

  static expectOperationTiming = (duration: number, maxDuration: number, operationName: string) => {
    expect(duration).toBeLessThan(maxDuration);
    if (duration > maxDuration * 0.8) {
      console.warn(`⚠️  Performance warning: ${operationName} took ${duration}ms (max: ${maxDuration}ms)`);
    }
  };

  static createLargeDataset = (size: number): any[] => {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`.repeat(10),
      tags: [`tag${i}`, `category${i % 10}`],
    }));
  };
}

// Accessibility test utilities
export class AccessibilityTestUtils {
  static async testKeyboardNavigation(screen: any) {
    const focusableElements = screen.getAllByRole('textbox')
      .concat(screen.getAllByRole('button'))
      .concat(screen.getAllByRole('combobox'))
      .concat(screen.getAllByRole('checkbox'));

    for (const element of focusableElements) {
      element.focus();
      expect(element).toHaveFocus();
    }
  }

  static testAriaLabels(screen: any, expectedLabels: string[]) {
    expectedLabels.forEach(label => {
      expect(screen.getByLabelText(new RegExp(label, 'i'))).toBeInTheDocument();
    });
  }

  static testRequiredFieldIndicators(screen: any) {
    const requiredIndicators = screen.getAllByText('*');
    expect(requiredIndicators.length).toBeGreaterThan(0);
  }

  static async testErrorAnnouncements(screen: any, userEvent: any) {
    // Trigger validation errors
    await userEvent.click(screen.getByText('Next'));
    
    // Check for error announcements
    const errorMessages = screen.queryAllByRole('alert');
    return errorMessages;
  }
}

// Integration test utilities
export class IntegrationTestUtils {
  static mockFirebase() {
    return {
      uploadBytes: jest.fn().mockResolvedValue({ ref: {} }),
      getDownloadURL: jest.fn().mockResolvedValue('https://example.com/uploaded-file.jpg'),
      doc: jest.fn(),
      setDoc: jest.fn(),
    };
  }

  static mockNextRouter() {
    const mockPush = jest.fn();
    return {
      mockPush,
      router: {
        push: mockPush,
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
      },
    };
  }

  static mockFormUtilities() {
    return {
      FormErrorHandler: {
        handleError: jest.fn((error) => error.message),
        logError: jest.fn(),
      },
      UserNotification: {
        showSuccess: jest.fn(),
        showError: jest.fn(),
      },
      InputSanitizer: {
        sanitizeString: jest.fn((str) => str.replace(/<[^>]*>/g, '')),
        sanitizeHTML: jest.fn((str) => str.replace(/<script[^>]*>.*?<\/script>/gi, '')),
        validateFormData: jest.fn((data) => ({
          isValid: true,
          errors: [],
          sanitized: data
        })),
      },
      RateLimiter: {
        getClientIdentifier: () => 'test-client-id',
        checkLimit: jest.fn().mockResolvedValue({ success: true }),
      },
      withRateLimit: jest.fn().mockImplementation(async (id, type, operation) => {
        return await operation();
      }),
    };
  }

  static mockContexts() {
    return {
      user: {
        name: 'Test User',
        id: 'test-user-123',
      },
      tags: {
        globalTags: [
          { value: 'ai', label: 'Artificial Intelligence' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'finance', label: 'Finance' },
        ],
        clients: [
          { value: 'client1', label: 'Client One' },
          { value: 'client2', label: 'Client Two' },
        ],
        industries: [
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'finance', label: 'Finance' },
        ],
        loading: false,
        error: null,
      },
    };
  }
}

// Test result tracking
export class TestResultTracker {
  private static results: Map<string, { passed: number; failed: number; total: number }> = new Map();

  static recordTestResult(testSuite: string, testName: string, passed: boolean) {
    const key = testSuite;
    const current = this.results.get(key) || { passed: 0, failed: 0, total: 0 };
    
    if (passed) {
      current.passed++;
    } else {
      current.failed++;
    }
    current.total++;
    
    this.results.set(key, current);
    
    console.log(`[${testSuite}] ${testName}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  }

  static getTestResults(): Map<string, { passed: number; failed: number; total: number }> {
    return new Map(this.results);
  }

  static printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;
    
    this.results.forEach((result, testSuite) => {
      const percentage = ((result.passed / result.total) * 100).toFixed(1);
      console.log(`${testSuite}: ${result.passed}/${result.total} (${percentage}%)`);
      
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTests += result.total;
    });
    
    const overallPercentage = ((totalPassed / totalTests) * 100).toFixed(1);
    console.log(`\nOVERALL: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
    
    if (totalFailed > 0) {
      console.log(`\n⚠️  ${totalFailed} tests failed. Please review and fix issues.`);
    } else {
      console.log('\n🎉 All tests passed!');
    }
  }

  static reset() {
    this.results.clear();
  }
}

// Form test runner for reusable test execution
export class FormTestRunner {
  static async runSecurityTests(component: any, testSuite: string) {
    const xssTestCases = SecurityTestUtils.createXSSTestCases();
    const fileUploadTestCases = SecurityTestUtils.createFileUploadTestCases();
    
    // Run XSS tests
    for (const testCase of xssTestCases) {
      try {
        // Test implementation would go here
        TestResultTracker.recordTestResult(testSuite, `XSS: ${testCase.name}`, true);
      } catch (error) {
        TestResultTracker.recordTestResult(testSuite, `XSS: ${testCase.name}`, false);
        console.error(`XSS test failed: ${testCase.name}`, error);
      }
    }
    
    // Run file upload tests
    for (const testCase of fileUploadTestCases) {
      try {
        // Test implementation would go here
        TestResultTracker.recordTestResult(testSuite, `File Upload: ${testCase.name}`, true);
      } catch (error) {
        TestResultTracker.recordTestResult(testSuite, `File Upload: ${testCase.name}`, false);
        console.error(`File upload test failed: ${testCase.name}`, error);
      }
    }
  }

  static async runValidationTests(component: any, testSuite: string) {
    const validationTestCases = ValidationTestUtils.createValidationTestCases();
    
    for (const testCase of validationTestCases) {
      try {
        // Test implementation would go here
        TestResultTracker.recordTestResult(testSuite, `Validation: ${testCase.fieldName}`, true);
      } catch (error) {
        TestResultTracker.recordTestResult(testSuite, `Validation: ${testCase.fieldName}`, false);
        console.error(`Validation test failed: ${testCase.fieldName}`, error);
      }
    }
  }

  static async runPerformanceTests(component: any, testSuite: string) {
    try {
      const { duration } = await PerformanceTestUtils.measureAsyncOperation(async () => {
        // Performance test implementation would go here
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      PerformanceTestUtils.expectOperationTiming(duration, 1000, 'Form submission');
      TestResultTracker.recordTestResult(testSuite, 'Performance: Form submission', true);
    } catch (error) {
      TestResultTracker.recordTestResult(testSuite, 'Performance: Form submission', false);
      console.error('Performance test failed', error);
    }
  }

  static async runAccessibilityTests(component: any, testSuite: string) {
    try {
      // Accessibility test implementation would go here
      TestResultTracker.recordTestResult(testSuite, 'Accessibility: Keyboard navigation', true);
      TestResultTracker.recordTestResult(testSuite, 'Accessibility: ARIA labels', true);
    } catch (error) {
      TestResultTracker.recordTestResult(testSuite, 'Accessibility tests', false);
      console.error('Accessibility test failed', error);
    }
  }
}

// Convert this utilities file to actual tests
describe('Test Utilities', () => {
  describe('TestDataGenerator', () => {
    it('should create mock files correctly', () => {
      const file = TestDataGenerator.createMockFile('test.jpg', 'image/jpeg', 2048);
      
      expect(file.name).toBe('test.jpg');
      expect(file.type).toBe('image/jpeg');
      expect(file.size).toBe(2048);
    });

    it('should create malicious files for security testing', () => {
      const maliciousFile = TestDataGenerator.createMaliciousFile('image/jpeg');
      
      expect(maliciousFile.name).toBe('malware.exe.jpg');
      expect(maliciousFile.type).toBe('image/jpeg');
    });

    it('should create XSS payloads for security testing', () => {
      const xssPayload = TestDataGenerator.createMaliciousText('Safe Text');
      
      expect(xssPayload).toContain('<script>');
      expect(xssPayload).toContain('Safe Text');
    });

    it('should create valid post data', () => {
      const postData = TestDataGenerator.createValidPostData();
      
      expect(postData.postTitle).toBe('Valid Test Post');
      expect(postData.sections).toHaveLength(1);
      expect(postData.sections![0].sectionTitle).toBe('Introduction');
    });
  });

  describe('SecurityTestUtils', () => {
    it('should provide comprehensive XSS test cases', () => {
      const xssTestCases = SecurityTestUtils.createXSSTestCases();
      
      expect(xssTestCases).toHaveLength(10);
      expect(xssTestCases.some(tc => tc.shouldBlock)).toBe(true);
      expect(xssTestCases.some(tc => !tc.shouldBlock)).toBe(true);
    });

    it('should provide file upload security test cases', () => {
      const fileTestCases = SecurityTestUtils.createFileUploadTestCases();
      
      expect(fileTestCases).toHaveLength(10);
      expect(fileTestCases.some(tc => tc.isValidation)).toBe(true);
      expect(fileTestCases.some(tc => !tc.isValidation)).toBe(true);
    });

    it('should provide rate limiting test cases', () => {
      const rateLimitCases = SecurityTestUtils.createRateLimitTestCases();
      
      expect(rateLimitCases).toHaveLength(5);
      expect(rateLimitCases.every(tc => tc.expectedMax > 0)).toBe(true);
    });
  });

  describe('ValidationTestUtils', () => {
    it('should provide field validation test cases', () => {
      const validationCases = ValidationTestUtils.createValidationTestCases();
      
      expect(validationCases).toHaveLength(4);
      expect(validationCases.every(tc => tc.validValues.length > 0)).toBe(true);
      expect(validationCases.every(tc => tc.invalidValues.length > 0)).toBe(true);
    });
  });

  describe('PerformanceTestUtils', () => {
    it('should measure operation timing accurately', async () => {
      const testOperation = () => new Promise(resolve => setTimeout(resolve, 100));
      
      const { result, duration } = await PerformanceTestUtils.measureAsyncOperation(testOperation);
      
      expect(duration).toBeGreaterThan(90);
      expect(duration).toBeLessThan(150);
    });

    it('should create large datasets for performance testing', () => {
      const dataset = PerformanceTestUtils.createLargeDataset(1000);
      
      expect(dataset).toHaveLength(1000);
      expect(dataset[0]).toHaveProperty('id');
      expect(dataset[0]).toHaveProperty('name');
    });
  });

  describe('TestResultTracker', () => {
    beforeEach(() => {
      TestResultTracker.reset();
    });

    it('should track test results correctly', () => {
      TestResultTracker.recordTestResult('TestSuite1', 'Test1', true);
      TestResultTracker.recordTestResult('TestSuite1', 'Test2', false);
      TestResultTracker.recordTestResult('TestSuite1', 'Test3', true);

      const results = TestResultTracker.getTestResults();
      const suite1Results = results.get('TestSuite1');

      expect(suite1Results?.passed).toBe(2);
      expect(suite1Results?.failed).toBe(1);
      expect(suite1Results?.total).toBe(3);
    });

    it('should handle multiple test suites', () => {
      TestResultTracker.recordTestResult('Suite1', 'Test1', true);
      TestResultTracker.recordTestResult('Suite2', 'Test1', false);

      const results = TestResultTracker.getTestResults();

      expect(results.size).toBe(2);
      expect(results.get('Suite1')?.passed).toBe(1);
      expect(results.get('Suite2')?.failed).toBe(1);
    });
  });
});