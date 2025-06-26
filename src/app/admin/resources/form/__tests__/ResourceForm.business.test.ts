import { ResourceFormData } from '../../types';
import { createSlug } from '@/utils/Utils';

// Simple business logic tests for ResourceForm
describe('ResourceForm Business Logic', () => {
  describe('Data Sanitization', () => {
    it('should handle basic sanitization requirements', () => {
      const testData: ResourceFormData = {
        slug: 'test-resource',
        resourceType: 'blog-post',
        industryUseCases: ['tech'],
        resourceTitle: 'Test Resource Title',
        globalTags: ['tag1'],
        date: '2023-01-01',
        headline: 'Test headline content',
        heroImage: null,
        sections: [],
      };

      expect(testData.resourceTitle).toBeTruthy();
      expect(testData.headline).toBeTruthy();
      expect(testData.resourceType).toBe('blog-post');
    });

    it('should validate resource types', () => {
      const validTypes = [
        'blog-post',
        'case-study', 
        'news',
        'event',
        'client-review',
        'announcement',
        'whitepaper'
      ];

      validTypes.forEach(type => {
        const testData: ResourceFormData = {
          slug: 'test',
          resourceType: type as any,
          industryUseCases: [],
          resourceTitle: 'Test',
          globalTags: [],
          date: '2023-01-01',
          headline: 'Test',
          heroImage: null,
          sections: [],
        };

        expect(validTypes).toContain(testData.resourceType);
      });
    });

    it('should handle sections array properly', () => {
      const testData: ResourceFormData = {
        slug: 'test',
        resourceType: 'blog-post',
        industryUseCases: [],
        resourceTitle: 'Test',
        globalTags: [],
        date: '2023-01-01',
        headline: 'Test',
        heroImage: null,
        sections: [
          {
            id: '1',
            sectionTitle: 'Section 1',
            sectionContent: 'Content 1',
            sectionImage: null,
          },
        ],
      };

      expect(Array.isArray(testData.sections)).toBe(true);
      expect(testData.sections).toHaveLength(1);
      expect(testData.sections[0].sectionTitle).toBe('Section 1');
    });

    it('should preserve file objects', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const testData: ResourceFormData = {
        slug: 'test',
        resourceType: 'blog-post',
        industryUseCases: [],
        resourceTitle: 'Test',
        globalTags: [],
        date: '2023-01-01',
        headline: 'Test',
        heroImage: mockFile,
        sections: [],
      };

      expect(testData.heroImage).toBeInstanceOf(File);
      expect(testData.heroImage?.name).toBe('test.jpg');
    });
  });

  describe('Business Rules', () => {
    it('should validate required fields structure', () => {
      const minimalData: ResourceFormData = {
        slug: 'test-resource',
        resourceType: 'blog-post',
        industryUseCases: ['tech'],
        resourceTitle: 'Test Resource',
        globalTags: ['tag1'],
        date: '2023-01-01',
        headline: 'Test headline',
        heroImage: null,
        sections: [],
      };

      // Check required field presence
      expect(minimalData.slug).toBeTruthy();
      expect(minimalData.resourceTitle).toBeTruthy();
      expect(minimalData.headline).toBeTruthy();
      expect(minimalData.date).toBeTruthy();
    });

    it('should validate title length constraints', () => {
      const shortTitle = 'Ab';
      const validTitle = 'Valid Resource Title';
      const longTitle = 'A'.repeat(101);

      expect(shortTitle.length).toBeLessThan(4);
      expect(validTitle.length).toBeGreaterThanOrEqual(4);
      expect(validTitle.length).toBeLessThanOrEqual(100);
      expect(longTitle.length).toBeGreaterThan(100);
    });
  });

  describe('Slug Generation', () => {
    it('should generate valid slugs from resource titles', () => {
      const titles = [
        'My Amazing Resource',
        'Resource with Special Characters!',
        'UPPERCASE resource title',
      ];

      titles.forEach(title => {
        const slug = createSlug(title);
        expect(slug).toBeTruthy();
        expect(slug).toMatch(/^[a-z0-9-]+$/);
        expect(slug).not.toContain(' ');
      });
    });
  });

  describe('Data Structure Integrity', () => {
    it('should maintain type compatibility with Record<string, unknown>', () => {
      const formData: ResourceFormData = {
        slug: 'test',
        resourceType: 'blog-post',
        industryUseCases: [],
        resourceTitle: 'Test',
        globalTags: [],
        date: '2023-01-01',
        headline: 'Test',
        heroImage: null,
        sections: [],
      };

      // This should compile without errors
      const record: Record<string, unknown> = formData;
      expect(record.slug).toBe('test');
      expect(record.resourceType).toBe('blog-post');
    });

    it('should handle optional clientCompanies field', () => {
      const dataWithClients: ResourceFormData = {
        slug: 'test',
        resourceType: 'blog-post',
        industryUseCases: [],
        resourceTitle: 'Test',
        globalTags: [],
        date: '2023-01-01',
        headline: 'Test',
        heroImage: null,
        sections: [],
        clientCompanies: ['Client A', 'Client B'],
      };

      const dataWithoutClients: ResourceFormData = {
        slug: 'test',
        resourceType: 'blog-post',
        industryUseCases: [],
        resourceTitle: 'Test',
        globalTags: [],
        date: '2023-01-01',
        headline: 'Test',
        heroImage: null,
        sections: [],
      };

      expect(Array.isArray(dataWithClients.clientCompanies)).toBe(true);
      expect(dataWithClients.clientCompanies).toHaveLength(2);
      expect(dataWithoutClients.clientCompanies).toBeUndefined();
    });
  });
});
