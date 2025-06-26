import { ResourceFormData, ResourceSectionItem } from '../../types';

describe('ResourceForm Types', () => {
  describe('ResourceSectionItem Interface', () => {
    it('should have required properties', () => {
      const sectionItem: ResourceSectionItem = {
        id: '1',
        sectionTitle: 'Test Section',
        sectionContent: 'Test content',
        sectionImage: null,
      };

      expect(sectionItem.id).toBe('1');
      expect(sectionItem.sectionTitle).toBe('Test Section');
      expect(sectionItem.sectionContent).toBe('Test content');
      expect(sectionItem.sectionImage).toBeNull();
    });

    it('should accept File object for sectionImage', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const sectionItem: ResourceSectionItem = {
        id: '1',
        sectionTitle: 'Test Section',
        sectionContent: 'Test content',
        sectionImage: mockFile,
      };

      expect(sectionItem.sectionImage).toBeInstanceOf(File);
      expect(sectionItem.sectionImage?.name).toBe('test.jpg');
    });
  });

  describe('ResourceFormData Interface', () => {
    it('should have all required properties', () => {
      const formData: ResourceFormData = {
        slug: 'test-resource',
        resourceType: 'blog-post',
        industryUseCases: ['tech', 'healthcare'],
        resourceTitle: 'Test Resource',
        globalTags: ['tag1', 'tag2'],
        date: '2023-01-01',
        headline: 'Test headline',
        heroImage: null,
        sections: [],
        clientCompanies: ['client1', 'client2'],
      };

      expect(formData.slug).toBe('test-resource');
      expect(formData.resourceType).toBe('blog-post');
      expect(formData.industryUseCases).toEqual(['tech', 'healthcare']);
      expect(formData.resourceTitle).toBe('Test Resource');
      expect(formData.globalTags).toEqual(['tag1', 'tag2']);
      expect(formData.date).toBe('2023-01-01');
      expect(formData.headline).toBe('Test headline');
      expect(formData.heroImage).toBeNull();
      expect(formData.sections).toEqual([]);
      expect(formData.clientCompanies).toEqual(['client1', 'client2']);
    });

    it('should accept valid resource types', () => {
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
        const formData: ResourceFormData = {
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

        expect(formData.resourceType).toBe(type);
      });
    });

    it('should allow empty resourceType', () => {
      const formData: ResourceFormData = {
        slug: 'test',
        resourceType: '',
        industryUseCases: [],
        resourceTitle: 'Test',
        globalTags: [],
        date: '2023-01-01',
        headline: 'Test',
        heroImage: null,
        sections: [],
      };

      expect(formData.resourceType).toBe('');
    });

    it('should accept File object for heroImage', () => {
      const mockFile = new File([''], 'hero.jpg', { type: 'image/jpeg' });
      const formData: ResourceFormData = {
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

      expect(formData.heroImage).toBeInstanceOf(File);
      expect(formData.heroImage?.name).toBe('hero.jpg');
    });

    it('should accept sections array', () => {
      const sections: ResourceSectionItem[] = [
        {
          id: '1',
          sectionTitle: 'Section 1',
          sectionContent: 'Content 1',
          sectionImage: null,
        },
        {
          id: '2',
          sectionTitle: 'Section 2',
          sectionContent: 'Content 2',
          sectionImage: new File([''], 'section.jpg', { type: 'image/jpeg' }),
        },
      ];

      const formData: ResourceFormData = {
        slug: 'test',
        resourceType: 'blog-post',
        industryUseCases: [],
        resourceTitle: 'Test',
        globalTags: [],
        date: '2023-01-01',
        headline: 'Test',
        heroImage: null,
        sections,
      };

      expect(formData.sections).toHaveLength(2);
      expect(formData.sections[0].sectionTitle).toBe('Section 1');
      expect(formData.sections[1].sectionImage).toBeInstanceOf(File);
    });

    it('should support index signature for additional properties', () => {
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
        customField: 'custom value',
        anotherField: 123,
      };

      expect(formData.customField).toBe('custom value');
      expect(formData.anotherField).toBe(123);
    });

    it('should handle undefined clientCompanies', () => {
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
        // clientCompanies is optional
      };

      expect(formData.clientCompanies).toBeUndefined();
    });

    it('should be compatible with Record<string, unknown>', () => {
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
  });
}); 