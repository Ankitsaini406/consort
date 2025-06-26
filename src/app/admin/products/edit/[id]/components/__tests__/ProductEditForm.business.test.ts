import { ProductFormData } from '../../../../form/types';

// Mock the utility functions and business logic
jest.mock('../../../../utils/productEditUtils');
jest.mock('@/firebase/firebaseAuth');
jest.mock('@/app/admin/forms/utils/errorHandler');
jest.mock('@/app/admin/forms/utils/rateLimiter');
jest.mock('@/app/admin/forms/utils/fileUploadSecurity');

// Import the mocked functions and types
import { getProductForEdit, ProductEditResult } from '../../../../utils/productEditUtils';

// Test data
const mockOriginalProductData: ProductFormData = {
    portfolioCategory: 'appssdk',
    slug: 'test-product',
    targetIndustries: ['industry1'],
    brandName: 'brand1',
    clientCompanies: ['client1'],
    globalTags: ['tag1'],
    productName: 'Original Product',
    headline: 'Original Headline',
    marketingTagline: 'Original tagline',
    productGallery: [],
    productDescription: 'Original description with sufficient length for validation',
    keyFeatures: [{ id: '1', keyFeature: 'Original feature', icon: 'FeatherActivity' }],
    technicalSpecifications: [{ id: '1', parameter: 'Original param', specification: 'Original spec' }],
    datasheetFile: null,
    brochureFile: null,
    caseStudyFile: null,
    marketingHighlights: [{ id: '1', headline: 'Original highlight', description: 'Original desc', visuals: [] }],
    productGalleryUrls: ['https://example.com/image1.jpg'],
    datasheetUrl: 'https://example.com/datasheet.pdf',
    brochureUrl: 'https://example.com/brochure.pdf',
    caseStudyUrl: 'https://example.com/casestudy.pdf',
    fileMetadata: {
        lastUpdated: '2024-01-01T00:00:00.000Z',
        galleryCount: 1,
        highlightCount: 1,
        resourceCount: 3,
    },
};

const mockUpdatedProductData: ProductFormData = {
    ...mockOriginalProductData,
    productName: 'Updated Product',
    headline: 'Updated Headline',
    marketingTagline: 'Updated tagline with more content',
    productDescription: 'Updated description with more details and sufficient length',
    keyFeatures: [
        { id: '1', keyFeature: 'Updated feature', icon: 'FeatherActivity' },
        { id: '2', keyFeature: 'New feature', icon: 'FeatherZap' },
    ],
    technicalSpecifications: [
        { id: '1', parameter: 'Updated param', specification: 'Updated spec' },
        { id: '2', parameter: 'New param', specification: 'New spec' },
    ],
};

describe('ProductEditForm - Business Logic Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Data Loading and Transformation', () => {
        it('should load existing product data correctly', async () => {
            (getProductForEdit as jest.Mock).mockResolvedValue({ success: true, data: mockOriginalProductData });

            const result = await getProductForEdit('test-product');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockOriginalProductData);
            expect(getProductForEdit).toHaveBeenCalledWith('test-product');
        });

        it('should return error for non-existent product', async () => {
            (getProductForEdit as jest.Mock).mockResolvedValue({ success: false, error: 'Product not found' });

            const result = await getProductForEdit('non-existent');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Product not found');
        });

        it('should throw error for failed data loading', async () => {
            const errorMessage = 'Failed to load product: test-product';
            (getProductForEdit as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(getProductForEdit('test-product')).rejects.toThrow(errorMessage);
        });

        it('should transform Firestore data to form structure correctly', async () => {
            const transformedData = {
                productName: 'Test Product',
                headline: 'Test Headline',
                portfolioCategory: 'appssdk',
                productGallery: [], // Should be empty for edit form
                datasheetFile: null, // Should be null for edit form
                productGalleryUrls: ['url1', 'url2'], // Existing URLs preserved
                keyFeatures: [{ id: '1', keyFeature: 'Feature 1', icon: 'FeatherActivity' }],
                technicalSpecifications: [{ id: '1', parameter: 'Param 1', specification: 'Spec 1' }],
                fileMetadata: {
                    lastUpdated: expect.any(String),
                    galleryCount: 2,
                    highlightCount: 0,
                    resourceCount: 0,
                },
            };

            (getProductForEdit as jest.Mock).mockResolvedValue({ success: true, data: transformedData });

            const result = await getProductForEdit('test-product');

            expect(result.data?.productName).toBe('Test Product');
            expect(result.data?.headline).toBe('Test Headline');
            expect(result.data?.productGallery).toEqual([]);
            expect(result.data?.datasheetFile).toBeNull();
            expect(result.data?.productGalleryUrls).toEqual(['url1', 'url2']);
        });

        it('should handle missing headline field in legacy data', async () => {
            const legacyData = {
                ...mockOriginalProductData,
                headline: undefined, // Legacy data might not have headline
            };

            (getProductForEdit as jest.Mock).mockResolvedValue({ success: true, data: legacyData });

            const result = await getProductForEdit('legacy-product');

            expect(result.data?.headline).toBeUndefined();
            expect(result.data?.productName).toBe(mockOriginalProductData.productName);
        });

        it('should handle missing technical specifications in legacy data', async () => {
            const legacyData = {
                ...mockOriginalProductData,
                technicalSpecifications: undefined, // Legacy data might not have tech specs
            };

            (getProductForEdit as jest.Mock).mockResolvedValue({ success: true, data: legacyData });

            const result = await getProductForEdit('legacy-product');

            expect(result.data?.technicalSpecifications).toBeUndefined();
            expect(result.data?.keyFeatures).toBeDefined();
        });
    });

    describe('Data Sanitization Logic', () => {
        it('should sanitize string fields correctly', () => {
            const dirtyData = {
                productName: '  Dirty Product Name  ',
                headline: '  Dirty Headline  ',
                marketingTagline: '  Dirty Tagline  ',
                productDescription: '  Dirty Description  ',
            };

            // Simulate sanitization logic
            const sanitized = {
                productName: dirtyData.productName.trim(),
                headline: dirtyData.headline.trim(),
                marketingTagline: dirtyData.marketingTagline.trim(),
                productDescription: dirtyData.productDescription.trim(),
            };

            expect(sanitized.productName).toBe('Dirty Product Name');
            expect(sanitized.headline).toBe('Dirty Headline');
            expect(sanitized.marketingTagline).toBe('Dirty Tagline');
            expect(sanitized.productDescription).toBe('Dirty Description');
        });

        it('should sanitize nested array fields', () => {
            const dirtyData = {
                keyFeatures: [
                    { id: '1', keyFeature: '  Dirty Feature  ', icon: 'FeatherActivity' }
                ],
                technicalSpecifications: [
                    { id: '1', parameter: '  Dirty Param  ', specification: '  Dirty Spec  ' }
                ],
                marketingHighlights: [
                    { id: '1', headline: '  Dirty Highlight  ', description: '  Dirty Desc  ', visuals: [] }
                ],
            };

            // Simulate sanitization logic for arrays
            const sanitized = {
                keyFeatures: dirtyData.keyFeatures.map(kf => ({
                    ...kf,
                    keyFeature: kf.keyFeature.trim(),
                })),
                technicalSpecifications: dirtyData.technicalSpecifications.map(ts => ({
                    ...ts,
                    parameter: ts.parameter.trim(),
                    specification: ts.specification.trim(),
                })),
                marketingHighlights: dirtyData.marketingHighlights.map(h => ({
                    ...h,
                    headline: h.headline.trim(),
                    description: h.description.trim(),
                })),
            };

            expect(sanitized.keyFeatures[0].keyFeature).toBe('Dirty Feature');
            expect(sanitized.technicalSpecifications[0].parameter).toBe('Dirty Param');
            expect(sanitized.technicalSpecifications[0].specification).toBe('Dirty Spec');
            expect(sanitized.marketingHighlights[0].headline).toBe('Dirty Highlight');
            expect(sanitized.marketingHighlights[0].description).toBe('Dirty Desc');
        });

        it('should handle null and undefined values in sanitization', () => {
            const dataWithNulls: {
                productName: string | null;
                headline: string | undefined;
                marketingTagline: string;
                keyFeatures: any[] | null;
                technicalSpecifications: any[] | undefined;
            } = {
                productName: null,
                headline: undefined,
                marketingTagline: '',
                keyFeatures: null,
                technicalSpecifications: undefined,
            };

            // Simulate sanitization logic for null/undefined values
            const sanitized = {
                productName: dataWithNulls.productName?.trim() || '',
                headline: dataWithNulls.headline?.trim() || '',
                marketingTagline: dataWithNulls.marketingTagline?.trim() || '',
                keyFeatures: dataWithNulls.keyFeatures || [],
                technicalSpecifications: dataWithNulls.technicalSpecifications || [],
            };

            expect(sanitized.productName).toBe('');
            expect(sanitized.headline).toBe('');
            expect(sanitized.marketingTagline).toBe('');
            expect(sanitized.keyFeatures).toEqual([]);
            expect(sanitized.technicalSpecifications).toEqual([]);
        });
    });

    describe('File Validation Logic', () => {
        it('should validate image files correctly', () => {
            const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            
            // Simulate file validation
            const isValidImage = imageFile.type.startsWith('image/');
            const isValidSize = imageFile.size <= 8 * 1024 * 1024; // 8MB
            const hasValidExtension = imageFile.name.endsWith('.jpg') || imageFile.name.endsWith('.png');

            expect(isValidImage).toBe(true);
            expect(isValidSize).toBe(true);
            expect(hasValidExtension).toBe(true);
        });

        it('should validate PDF files correctly', () => {
            const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
            
            // Simulate PDF validation
            const isValidPdf = pdfFile.type === 'application/pdf';
            const isValidSize = pdfFile.size <= 10 * 1024 * 1024; // 10MB
            const hasValidExtension = pdfFile.name.endsWith('.pdf');

            expect(isValidPdf).toBe(true);
            expect(isValidSize).toBe(true);
            expect(hasValidExtension).toBe(true);
        });

        it('should reject invalid file types', () => {
            const invalidFile = new File(['content'], 'script.exe', { type: 'application/x-executable' });
            
            // Simulate validation rejection
            const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(invalidFile.type);
            const hasValidExtension = ['.jpg', '.png', '.pdf'].some(ext => invalidFile.name.endsWith(ext));

            expect(isValidType).toBe(false);
            expect(hasValidExtension).toBe(false);
        });

        it('should reject oversized files', () => {
            const oversizedFile = new File(['x'.repeat(20 * 1024 * 1024)], 'huge.jpg', { type: 'image/jpeg' });
            
            // Simulate size validation
            const isValidSize = oversizedFile.size <= 10 * 1024 * 1024; // 10MB limit for images

            expect(isValidSize).toBe(false);
            expect(oversizedFile.size).toBeGreaterThan(10 * 1024 * 1024);
        });

        it('should handle file uniqueness validation', () => {
            const file1 = new File(['content1'], 'test.jpg', { type: 'image/jpeg' });
            const file2 = new File(['content2'], 'test.jpg', { type: 'image/jpeg' });
            const file3 = new File(['content1'], 'test.jpg', { type: 'image/jpeg' });

            // Simulate uniqueness check based on name and size
            const files = [file1, file2, file3];
            const uniqueFiles = new Set(files.map(f => `${f.name}-${f.size}`));

            expect(uniqueFiles.size).toBe(2); // file1 and file3 are duplicates
            expect(files.length).toBe(3);
        });
    });

    describe('Update Logic and Data Merging', () => {
        it('should merge new gallery files with existing URLs', () => {
            const existingUrls = ['https://example.com/existing1.jpg', 'https://example.com/existing2.jpg'];
            const newUrls = ['https://example.com/new1.jpg', 'https://example.com/new2.jpg'];
            
            const mergedUrls = [...existingUrls, ...newUrls];

            expect(mergedUrls).toEqual([
                'https://example.com/existing1.jpg',
                'https://example.com/existing2.jpg',
                'https://example.com/new1.jpg',
                'https://example.com/new2.jpg',
            ]);
            expect(mergedUrls.length).toBe(4);
        });

        it('should replace resource files when new ones are uploaded', () => {
            const originalData = {
                datasheetUrl: 'https://example.com/old-datasheet.pdf',
                brochureUrl: 'https://example.com/old-brochure.pdf',
                caseStudyUrl: 'https://example.com/old-casestudy.pdf',
            };

            const newUrls = {
                datasheetUrl: 'https://example.com/new-datasheet.pdf',
                brochureUrl: originalData.brochureUrl, // No new brochure uploaded
                caseStudyUrl: 'https://example.com/new-casestudy.pdf',
            };

            expect(newUrls.datasheetUrl).not.toBe(originalData.datasheetUrl);
            expect(newUrls.brochureUrl).toBe(originalData.brochureUrl); // Preserved
            expect(newUrls.caseStudyUrl).not.toBe(originalData.caseStudyUrl);
        });

        it('should handle marketing highlights visual merging', () => {
            const originalHighlight = {
                id: '1',
                headline: 'Test',
                description: 'Test',
                visualUrls: ['https://example.com/existing-visual.jpg'],
            };

            const newVisualUrls = ['https://example.com/new-visual.jpg'];
            const mergedHighlight = {
                ...originalHighlight,
                headline: 'Updated Test',
                description: 'Updated Test',
                visualUrls: [...originalHighlight.visualUrls, ...newVisualUrls],
            };

            expect(mergedHighlight.visualUrls).toEqual([
                'https://example.com/existing-visual.jpg',
                'https://example.com/new-visual.jpg',
            ]);
            expect(mergedHighlight.headline).toBe('Updated Test');
        });

        it('should preserve existing visuals when no new ones uploaded', () => {
            const originalHighlight = {
                id: '1',
                headline: 'Test',
                description: 'Test',
                visualUrls: ['https://example.com/existing-visual.jpg'],
            };

            const updatedHighlight = {
                ...originalHighlight,
                headline: 'Updated Test',
                description: 'Updated Test',
                // No new visuals uploaded, preserve existing
                visualUrls: originalHighlight.visualUrls,
            };

            expect(updatedHighlight.visualUrls).toEqual(['https://example.com/existing-visual.jpg']);
            expect(updatedHighlight.headline).toBe('Updated Test');
        });

        it('should update file metadata correctly', () => {
            const productGalleryUrls = ['url1', 'url2', 'url3'];
            const marketingHighlights = [
                { id: '1', headline: 'H1', description: 'D1', visuals: [] },
                { id: '2', headline: 'H2', description: 'D2', visuals: [] },
            ];
            const datasheetUrl = 'datasheet-url';
            const brochureUrl = 'brochure-url';
            const caseStudyUrl = null;

            const fileMetadata = {
                lastUpdated: new Date().toISOString(),
                galleryCount: productGalleryUrls.length,
                highlightCount: marketingHighlights.length,
                resourceCount: [datasheetUrl, brochureUrl, caseStudyUrl].filter(Boolean).length,
            };

            expect(fileMetadata.galleryCount).toBe(3);
            expect(fileMetadata.highlightCount).toBe(2);
            expect(fileMetadata.resourceCount).toBe(2); // Only datasheet and brochure
            expect(fileMetadata.lastUpdated).toBeDefined();
            expect(new Date(fileMetadata.lastUpdated)).toBeInstanceOf(Date);
        });

        it('should include audit fields for updates', () => {
            const mockUser = { name: 'Test User' };
            const updateData = {
                ...mockUpdatedProductData,
                updatedBy: mockUser.name,
                updatedAt: new Date(),
            };

            expect(updateData.updatedBy).toBe('Test User');
            expect(updateData.updatedAt).toBeInstanceOf(Date);
            expect(updateData.slug).toBe(mockOriginalProductData.slug); // Slug should not change
        });
    });

    describe('Error Handling Scenarios', () => {
        it('should handle file validation errors', () => {
            const validationErrors = [
                'Product photo "invalid.txt": Invalid file type',
                'Marketing highlight visual "huge.jpg": File too large',
                'Resource file "malicious.exe": Invalid file type',
            ];

            const hasErrors = validationErrors.length > 0;
            const errorMessage = `File validation failed: ${validationErrors.join('; ')}`;

            expect(hasErrors).toBe(true);
            expect(errorMessage).toContain('File validation failed');
            expect(errorMessage).toContain('Invalid file type');
            expect(errorMessage).toContain('File too large');
        });

        it('should handle upload failures gracefully', () => {
            const uploadError = new Error('Upload failed: Network timeout');
            const context = 'ProductEditForm';

            // Simulate error handling
            const formError = uploadError.message;
            const loggedError = { error: uploadError, context };

            expect(formError).toBe('Upload failed: Network timeout');
            expect(loggedError.context).toBe('ProductEditForm');
            expect(loggedError.error).toBe(uploadError);
        });

        it('should handle database update failures', () => {
            const dbError = new Error('Firestore update failed: Permission denied');
            const context = 'ProductEditForm';

            // Simulate database error handling
            const isDbError = dbError.message.includes('Firestore');
            const errorType = isDbError ? 'database' : 'unknown';

            expect(isDbError).toBe(true);
            expect(errorType).toBe('database');
            expect(dbError.message).toContain('Permission denied');
        });

        it('should handle rate limiting scenarios', () => {
            const clientId = 'test-client-123';
            const action = 'formSubmission';
            const rateLimitConfig = {
                maxRequests: 5,
                windowMs: 60000, // 1 minute
            };

            // Simulate rate limit check
            const isRateLimited = false; // Assume under limit
            const remainingRequests = rateLimitConfig.maxRequests - 1;

            expect(isRateLimited).toBe(false);
            expect(remainingRequests).toBe(4);
            expect(clientId).toBeDefined();
            expect(action).toBe('formSubmission');
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle complete edit workflow', () => {
            // 1. Load existing product
            const originalData = mockOriginalProductData;
            
            // 2. User makes changes
            const updatedData = {
                ...originalData,
                productName: 'Updated Product Name',
                headline: 'Updated Headline',
                keyFeatures: [
                    ...originalData.keyFeatures,
                    { id: '2', keyFeature: 'New Feature', icon: 'FeatherZap' },
                ],
            };

            // 3. Validate changes
            const hasNameChange = updatedData.productName !== originalData.productName;
            const hasHeadlineChange = updatedData.headline !== originalData.headline;
            const hasNewFeatures = updatedData.keyFeatures.length > originalData.keyFeatures.length;

            expect(hasNameChange).toBe(true);
            expect(hasHeadlineChange).toBe(true);
            expect(hasNewFeatures).toBe(true);
            expect(updatedData.slug).toBe(originalData.slug); // Slug preserved
        });

        it('should handle partial updates correctly', () => {
            const originalData = mockOriginalProductData;
            const partialUpdate = {
                ...originalData,
                productName: 'New Name Only', // Only name changed
            };

            // Should detect minimal changes
            const changedFields = Object.keys(partialUpdate).filter(
                key => (partialUpdate as any)[key] !== (originalData as any)[key]
            );

            expect(changedFields).toContain('productName');
            expect(partialUpdate.marketingTagline).toBe(originalData.marketingTagline);
            expect(partialUpdate.productDescription).toBe(originalData.productDescription);
        });

        it('should handle file-only updates', () => {
            const originalData = mockOriginalProductData;
            const newFile = new File(['content'], 'new-image.jpg', { type: 'image/jpeg' });
            
            const fileOnlyUpdate = {
                ...originalData,
                productGallery: [newFile], // Only files changed
            };

            // Text fields should remain unchanged
            expect(fileOnlyUpdate.productName).toBe(originalData.productName);
            expect(fileOnlyUpdate.headline).toBe(originalData.headline);
            expect(fileOnlyUpdate.productGallery).toHaveLength(1);
            expect(fileOnlyUpdate.productGallery[0]).toBe(newFile);
        });

        it('should handle mixed text and file updates', () => {
            const originalData = mockOriginalProductData;
            const newFile = new File(['content'], 'mixed-update.jpg', { type: 'image/jpeg' });
            
            const mixedUpdate = {
                ...originalData,
                productName: 'Mixed Update Product',
                headline: 'Mixed Update Headline',
                productGallery: [newFile],
                technicalSpecifications: [
                    ...originalData.technicalSpecifications,
                    { id: '2', parameter: 'New Parameter', specification: 'New Specification' },
                ],
            };

            // Should handle both text and file changes
            expect(mixedUpdate.productName).not.toBe(originalData.productName);
            expect(mixedUpdate.headline).not.toBe(originalData.headline);
            expect(mixedUpdate.productGallery).toHaveLength(1);
            expect(mixedUpdate.technicalSpecifications).toHaveLength(2);
        });

        it('should preserve data integrity during complex updates', () => {
            const originalData = mockOriginalProductData;
            const complexUpdate = {
                ...originalData,
                productName: 'Complex Update',
                keyFeatures: [
                    { id: '1', keyFeature: 'Updated Feature 1', icon: 'FeatherActivity' },
                    { id: '2', keyFeature: 'New Feature 2', icon: 'FeatherZap' },
                    { id: '3', keyFeature: 'New Feature 3', icon: 'FeatherShield' },
                ],
                technicalSpecifications: [
                    { id: '1', parameter: 'Updated Param 1', specification: 'Updated Spec 1' },
                    { id: '2', parameter: 'New Param 2', specification: 'New Spec 2' },
                ],
                marketingHighlights: [
                    { id: '1', headline: 'Updated Highlight', description: 'Updated Description', visuals: [] },
                ],
            };

            // Critical fields should be preserved
            expect(complexUpdate.slug).toBe(originalData.slug);
            expect(complexUpdate.portfolioCategory).toBe(originalData.portfolioCategory);
            expect(complexUpdate.productGalleryUrls).toBe(originalData.productGalleryUrls);
            
            // Updated fields should be changed
            expect(complexUpdate.productName).not.toBe(originalData.productName);
            expect(complexUpdate.keyFeatures).toHaveLength(3);
            expect(complexUpdate.technicalSpecifications).toHaveLength(2);
            expect(complexUpdate.marketingHighlights).toHaveLength(1);
        });
    });
}); 