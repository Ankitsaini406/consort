import { ProductFormData, TechnicalSpecification, KeyFeature, MarketingHighlight } from '../types';

describe('Product Form Types', () => {
  describe('TechnicalSpecification Interface', () => {
    test('should have correct structure', () => {
      const techSpec: TechnicalSpecification = {
        id: '1',
        parameter: 'Operating Temperature',
        specification: '-40°C to +85°C'
      };

      expect(techSpec).toHaveProperty('id');
      expect(techSpec).toHaveProperty('parameter');
      expect(techSpec).toHaveProperty('specification');
      expect(typeof techSpec.id).toBe('string');
      expect(typeof techSpec.parameter).toBe('string');
      expect(typeof techSpec.specification).toBe('string');
    });

    test('should allow valid technical specification data', () => {
      const validSpecs: TechnicalSpecification[] = [
        { id: '1', parameter: 'Temperature', specification: '-40°C to +85°C' },
        { id: '2', parameter: 'Humidity', specification: '5% to 95% RH' },
        { id: '3', parameter: 'Power', specification: '5W max' },
      ];

      validSpecs.forEach(spec => {
        expect(spec.id).toBeDefined();
        expect(spec.parameter).toBeDefined();
        expect(spec.specification).toBeDefined();
      });
    });
  });

  describe('KeyFeature Interface', () => {
    test('should have correct structure', () => {
      const keyFeature: KeyFeature = {
        id: '1',
        keyFeature: 'High Performance',
        icon: 'FeatherActivity'
      };

      expect(keyFeature).toHaveProperty('id');
      expect(keyFeature).toHaveProperty('keyFeature');
      expect(keyFeature).toHaveProperty('icon');
      expect(typeof keyFeature.id).toBe('string');
      expect(typeof keyFeature.keyFeature).toBe('string');
      expect(typeof keyFeature.icon).toBe('string');
    });
  });

  describe('MarketingHighlight Interface', () => {
    test('should have correct structure', () => {
      const highlight: MarketingHighlight = {
        id: '1',
        headline: 'Revolutionary Performance',
        description: 'Delivers unprecedented performance',
        visuals: [],
        visualUrls: ['https://example.com/image.jpg']
      };

      expect(highlight).toHaveProperty('id');
      expect(highlight).toHaveProperty('headline');
      expect(highlight).toHaveProperty('description');
      expect(highlight).toHaveProperty('visuals');
      expect(Array.isArray(highlight.visuals)).toBe(true);
    });
  });

  describe('ProductFormData Interface', () => {
    test('should have all required headline field', () => {
      const formData: Partial<ProductFormData> = {
        productName: 'Test Product',
        headline: 'Test Headline',
        marketingTagline: 'Test tagline',
      };

      expect(formData).toHaveProperty('headline');
      expect(typeof formData.headline).toBe('string');
    });

    test('should have technicalSpecifications field', () => {
      const formData: Partial<ProductFormData> = {
        technicalSpecifications: [
          { id: '1', parameter: 'Temperature', specification: '-40°C to +85°C' }
        ]
      };

      expect(formData).toHaveProperty('technicalSpecifications');
      expect(Array.isArray(formData.technicalSpecifications)).toBe(true);
      expect(formData.technicalSpecifications?.[0]).toHaveProperty('parameter');
      expect(formData.technicalSpecifications?.[0]).toHaveProperty('specification');
    });

    test('should allow complete form data structure', () => {
      const completeFormData: ProductFormData = {
        portfolioCategory: 'appssdk',
        targetIndustries: ['tech'],
        brandName: 'Test Brand',
        clientCompanies: ['Client A'],
        globalTags: ['tag1'],
        productName: 'Test Product',
        headline: 'Test Headline',
        marketingTagline: 'Test tagline',
        productGallery: [],
        productDescription: 'Test description',
        keyFeatures: [{ id: '1', keyFeature: 'Test Feature', icon: 'FeatherActivity' }],
        technicalSpecifications: [{ id: '1', parameter: 'Test Param', specification: 'Test Spec' }],
        datasheetFile: null,
        brochureFile: null,
        caseStudyFile: null,
        marketingHighlights: [],
      };

      // Verify all required fields are present
      expect(completeFormData.productName).toBeDefined();
      expect(completeFormData.headline).toBeDefined();
      expect(completeFormData.technicalSpecifications).toBeDefined();
      expect(Array.isArray(completeFormData.technicalSpecifications)).toBe(true);
      expect(Array.isArray(completeFormData.keyFeatures)).toBe(true);
      expect(Array.isArray(completeFormData.marketingHighlights)).toBe(true);
    });

    test('should support index signature for compatibility', () => {
      const formData: ProductFormData = {
        portfolioCategory: 'appssdk',
        targetIndustries: ['tech'],
        brandName: 'Test Brand',
        clientCompanies: ['Client A'],
        globalTags: ['tag1'],
        productName: 'Test Product',
        headline: 'Test Headline',
        marketingTagline: 'Test tagline',
        productGallery: [],
        productDescription: 'Test description',
        keyFeatures: [],
        technicalSpecifications: [],
        datasheetFile: null,
        brochureFile: null,
        caseStudyFile: null,
        marketingHighlights: [],
      };

      // Should be able to access properties dynamically
      const dynamicAccess = formData['productName'];
      expect(dynamicAccess).toBe('Test Product');

      // Should be able to set dynamic properties
      formData['customField'] = 'custom value';
      expect(formData['customField']).toBe('custom value');
    });
  });

  describe('Type Compatibility', () => {
    test('should work with Record<string, unknown>', () => {
      const formDataAsRecord: Record<string, unknown> = {
        productName: 'Test Product',
        headline: 'Test Headline',
        technicalSpecifications: [
          { id: '1', parameter: 'Test', specification: 'Test Value' }
        ]
      };

      // Should be compatible due to index signature
      const typedFormData = formDataAsRecord as ProductFormData;
      expect(typedFormData.productName).toBe('Test Product');
      expect(typedFormData.headline).toBe('Test Headline');
    });
  });
}); 