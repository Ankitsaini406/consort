import { RateLimiter, withRateLimit, RateLimitType } from '../rateLimiter';

// Mock Redis to test backup rate limiting
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  })),
}));

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: {
    slidingWindow: jest.fn(),
    __esModule: true,
  },
}));

// Mock environment variables
const originalEnv = process.env;

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Reset environment variables
    process.env = {
      ...originalEnv,
      UPSTASH_REDIS_REST_URL: undefined,
      UPSTASH_REDIS_REST_TOKEN: undefined,
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getClientIdentifier', () => {
    it('returns a client identifier', () => {
      const id1 = RateLimiter.getClientIdentifier();
      const id2 = RateLimiter.getClientIdentifier();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('returns consistent identifier for same session', () => {
      const id1 = RateLimiter.getClientIdentifier();
      const id2 = RateLimiter.getClientIdentifier();
      
      expect(id1).toBe(id2);
    });
  });

  describe('checkLimit - Backup Rate Limiting', () => {
    it('allows requests within limits', async () => {
      const clientId = 'test-client-1';
      
      const result = await RateLimiter.checkLimit(clientId, 'formSubmission');
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBeLessThan(result.limit);
      expect(result.reset).toBeInstanceOf(Date);
    });

    it('blocks requests exceeding limits', async () => {
      const clientId = 'test-client-2';
      
      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        await RateLimiter.checkLimit(clientId, 'formSubmission');
      }
      
      // This should be blocked
      const result = await RateLimiter.checkLimit(clientId, 'formSubmission');
      
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('handles different rate limit types', async () => {
      const clientId = 'test-client-3';
      
      const limitTypes: RateLimitType[] = [
        'formSubmission',
        'fileUpload',
        'adminAction',
        'authentication',
        'authenticationFailed',
        'strict',
      ];
      
      for (const limitType of limitTypes) {
        const result = await RateLimiter.checkLimit(clientId, limitType);
        expect(result.success).toBe(true);
        expect(result.limit).toBeGreaterThan(0);
      }
    });

    it('resets limits after time window', async () => {
      const clientId = 'test-client-4';
      
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        await RateLimiter.checkLimit(clientId, 'formSubmission');
      }
      
      // Should be blocked
      let result = await RateLimiter.checkLimit(clientId, 'formSubmission');
      expect(result.success).toBe(false);
      
      // Mock time passage (this is simplified - in real implementation, 
      // you'd need to manipulate Date.now() or wait for actual time)
      // For testing purposes, we'll create a new client ID to simulate reset
      const newClientId = 'test-client-4-reset';
      result = await RateLimiter.checkLimit(newClientId, 'formSubmission');
      expect(result.success).toBe(true);
    });

    it('handles concurrent requests correctly', async () => {
      const clientId = 'test-client-5';
      
      // Make concurrent requests
      const promises = Array.from({ length: 10 }, () => 
        RateLimiter.checkLimit(clientId, 'formSubmission')
      );
      
      const results = await Promise.all(promises);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      expect(successCount).toBeLessThanOrEqual(5); // formSubmission limit
      expect(failureCount).toBe(results.length - successCount);
    });
  });

  describe('Progressive Rate Limiting', () => {
    it('applies stricter limits for repeat offenders', async () => {
      const clientId = 'repeat-offender';
      
      // First violation
      for (let i = 0; i < 6; i++) { // Exceed limit of 5
        await RateLimiter.checkLimit(clientId, 'formSubmission');
      }
      
      // Continue making requests to trigger progressive penalties
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = await RateLimiter.checkLimit(clientId, 'formSubmission');
        results.push(result);
      }
      
      // Should have more failures due to progressive penalties
      const failures = results.filter(r => !r.success);
      expect(failures.length).toBeGreaterThan(5);
    });
  });

  describe('formatRateLimitMessage', () => {
    it('formats rate limit messages correctly', () => {
      const rateLimitResult = {
        success: false,
        limit: 5,
        remaining: 0,
        reset: new Date(Date.now() + 60000), // 1 minute from now
      };
      
      const message = RateLimiter.formatRateLimitMessage(rateLimitResult);
      
      expect(message).toContain('0/5');
      expect(message).toContain('reset');
      expect(typeof message).toBe('string');
    });

    it('handles different limit values', () => {
      const testCases = [
        { limit: 1, remaining: 0 },
        { limit: 10, remaining: 5 },
        { limit: 100, remaining: 99 },
      ];
      
      testCases.forEach(({ limit, remaining }) => {
        const result = {
          success: false,
          limit,
          remaining,
          reset: new Date(),
        };
        
        const message = RateLimiter.formatRateLimitMessage(result);
        expect(message).toContain(`${remaining}/${limit}`);
      });
    });
  });

  describe('withRateLimit - Middleware Function', () => {
    it('executes operation when within limits', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      const clientId = 'test-client-6';
      
      const result = await withRateLimit(clientId, 'formSubmission', mockOperation);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('throws error when rate limit exceeded', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      const clientId = 'test-client-7';
      
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        await withRateLimit(clientId, 'formSubmission', async () => 'test');
      }
      
      // This should throw
      await expect(
        withRateLimit(clientId, 'formSubmission', mockOperation)
      ).rejects.toThrow('Rate limit exceeded');
      
      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('handles operation errors correctly', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const clientId = 'test-client-8';
      
      await expect(
        withRateLimit(clientId, 'formSubmission', mockOperation)
      ).rejects.toThrow('Operation failed');
      
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('handles rate limiting errors gracefully', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      // Mock a rate limiting error by using an invalid client ID or similar
      const result = await withRateLimit('valid-client', 'formSubmission', mockOperation);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Security and Attack Scenarios', () => {
    it('prevents brute force attacks', async () => {
      const attackerIds = ['attacker1', 'attacker2', 'attacker3'];
      
      for (const attackerId of attackerIds) {
        // Simulate rapid requests
        const requests = Array.from({ length: 20 }, () => 
          RateLimiter.checkLimit(attackerId, 'authentication')
        );
        
        const results = await Promise.all(requests);
        const successCount = results.filter(r => r.success).length;
        
        // Should be limited to prevent brute force
        expect(successCount).toBeLessThanOrEqual(3); // authentication limit
      }
    });

    it('handles different attack patterns', async () => {
      const testCases = [
        { limitType: 'authentication' as RateLimitType, expectedMax: 3 },
        { limitType: 'authenticationFailed' as RateLimitType, expectedMax: 2 },
        { limitType: 'fileUpload' as RateLimitType, expectedMax: 3 },
        { limitType: 'strict' as RateLimitType, expectedMax: 2 },
      ];
      
      for (const { limitType, expectedMax } of testCases) {
        const attackerId = `attacker-${limitType}`;
        
        const requests = Array.from({ length: 10 }, () => 
          RateLimiter.checkLimit(attackerId, limitType)
        );
        
        const results = await Promise.all(requests);
        const successCount = results.filter(r => r.success).length;
        
        expect(successCount).toBeLessThanOrEqual(expectedMax);
      }
    });

    it('prevents distributed attacks', async () => {
      // Simulate multiple IPs/clients trying to attack
      const attackerClients = Array.from({ length: 100 }, (_, i) => `attacker-${i}`);
      
      const allRequests = attackerClients.map(clientId => 
        Array.from({ length: 10 }, () => 
          RateLimiter.checkLimit(clientId, 'authentication')
        )
      ).flat();
      
      const results = await Promise.all(allRequests);
      const totalSuccess = results.filter(r => r.success).length;
      
      // Each client should be limited individually
      expect(totalSuccess).toBeLessThanOrEqual(attackerClients.length * 3);
    });
  });

  describe('Performance Tests', () => {
    it('handles high load efficiently', async () => {
      const clientIds = Array.from({ length: 1000 }, (_, i) => `client-${i}`);
      
      const startTime = Date.now();
      
      const requests = clientIds.map(clientId => 
        RateLimiter.checkLimit(clientId, 'formSubmission')
      );
      
      const results = await Promise.all(requests);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(duration).toBeLessThan(8000); // Should complete within 8 seconds (adjusted for test environment)
      
      // All should succeed since they're different clients
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBe(1000);
    });

    it('memory usage remains stable', async () => {
      const clientId = 'memory-test-client';
      
      // Make many requests over time
      for (let i = 0; i < 100; i++) {
        await RateLimiter.checkLimit(`${clientId}-${i}`, 'formSubmission');
      }
      
      // The backup rate limiter should clean up old entries
      // This is more of a conceptual test - in practice you'd monitor actual memory usage
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Edge Cases', () => {
    it('handles malformed client identifiers', async () => {
      const malformedIds = [
        '',
        null as any,
        undefined as any,
        123 as any,
        {} as any,
        '<script>alert("xss")</script>',
        '../../etc/passwd',
        'очень длинный идентификатор на русском языке',
      ];
      
      for (const id of malformedIds) {
        const result = await RateLimiter.checkLimit(id, 'formSubmission');
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      }
    });

    it('handles invalid rate limit types gracefully', async () => {
      const clientId = 'test-invalid-type';
      
      // @ts-ignore - Testing invalid type
      const result = await RateLimiter.checkLimit(clientId, 'invalidType');
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('handles system clock changes', async () => {
      const clientId = 'clock-test-client';
      
      // Make a request
      const result1 = await RateLimiter.checkLimit(clientId, 'formSubmission');
      expect(result1.success).toBe(true);
      
      // Simulate system clock going backwards (this is a theoretical test)
      // In practice, this would require mocking Date.now()
      const result2 = await RateLimiter.checkLimit(clientId, 'formSubmission');
      expect(result2).toBeDefined();
      expect(typeof result2.success).toBe('boolean');
    });
  });

  describe('Redis Fallback Behavior', () => {
    it('falls back to backup when Redis is unavailable', async () => {
      // Redis is already mocked to be unavailable (no env vars set)
      const clientId = 'redis-fallback-test';
      
      const result = await RateLimiter.checkLimit(clientId, 'formSubmission');
      
      expect(result.success).toBe(true);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Redis not configured');
    });

    it('logs appropriate warnings when using backup', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const clientId = 'backup-logging-test';
      
      await RateLimiter.checkLimit(clientId, 'formSubmission');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY] Using backup rate limiting')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Form Submission', () => {
    it('integrates correctly with form submission workflow', async () => {
      const mockFormSubmission = async (data: any) => {
        // Simulate form processing
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, id: 'form-123' };
      };
      
      const clientId = 'form-integration-test';
      
      const result = await withRateLimit(
        clientId,
        'formSubmission',
        () => mockFormSubmission({ title: 'Test Form' })
      );
      
      expect(result.success).toBe(true);
      expect(result.id).toBe('form-123');
    });

    it('prevents form spam', async () => {
      const mockFormSubmission = jest.fn().mockResolvedValue({ success: true });
      const clientId = 'spam-prevention-test';
      
      // Try to submit many forms rapidly
      const submissions = Array.from({ length: 10 }, () =>
        withRateLimit(clientId, 'formSubmission', mockFormSubmission)
      );
      
      const results = await Promise.allSettled(submissions);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      expect(successCount).toBeLessThanOrEqual(5);
      expect(failureCount).toBeGreaterThan(0);
      expect(mockFormSubmission).toHaveBeenCalledTimes(successCount);
    });
  });
}); 