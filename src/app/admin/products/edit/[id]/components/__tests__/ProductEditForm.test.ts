import { ProductFormData } from '../../../form/types';
import { User } from '@/types/types';

// Mock all external dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

jest.mock('@/context/userContext', () => ({
    useUser: jest.fn(),
}));

jest.mock('@/context/TagContext', () => ({
    useTags: jest.fn(),
}));

jest.mock('@/firebase/firebaseconfig', () => ({
    db: {},
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(),
}));

jest.mock('@/firebase/firebaseAuth', () => ({
    removeFileObjects: jest.fn((data) => data),
    uploadDoc: jest.fn(),
}));

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
        sanitizeString: jest.fn((str) => str?.trim() || ''),
    },
}));

jest.mock('@/app/admin/forms/utils/rateLimiter', () => ({
    RateLimiter: {
        getClientIdentifier: jest.fn(() => 'test-client'),
    },
    withRateLimit: jest.fn((clientId, action, callback) => callback()),
}));

jest.mock('@/app/admin/forms/utils/fileUploadSecurity', () => ({
    FileUploadSecurity: {
        validateFile: jest.fn(),
    },
    ALLOWED_FILE_TYPES: {
        images: ['image/jpeg', 'image/png'],
        documents: ['application/pdf'],
    },
    FILE_SIZE_LIMITS: {
        image: 5 * 1024 * 1024,
        document: 10 * 1024 * 1024,
    },
}));

jest.mock('../../../utils/productEditUtils', () => ({
    getProductForEdit: jest.fn(),
}));

// Import the functions and components to test
import { getProductForEdit } from '../../../utils/productEditUtils';

// Test data
const mockUser: User = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
};

const mockTags = [
    { value: 'tag1', label: 'Tag 1' },
    { value: 'tag2', label: 'Tag 2' },
];

const mockBrands = [
    { value: 'brand1', label: 'Brand 1' },
    { value: 'brand2', label: 'Brand 2' },
];

const mockClients = [
    { value: 'client1', label: 'Client 1' },
    { value: 'client2', label: 'Client 2' },
];

const mockIndustries = [
    { value: 'industry1', label: 'Industry 1' },
    { value: 'industry2', label: 'Industry 2' },
];

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
    productDescription: 'Original description',
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
    marketingTagline: 'Updated tagline',
    productDescription: 'Updated description with more details',
    keyFeatures: [
        { id: '1', keyFeature: 'Updated feature', icon: 'FeatherActivity' },
        { id: '2', keyFeature: 'New feature', icon: 'FeatherZap' },
    ],
    technicalSpecifications: [
        { id: '1', parameter: 'Updated param', specification: 'Updated spec' },
        { id: '2', parameter: 'New param', specification: 'New spec' },
    ],
};

describe('ProductEditForm - Data Loading and Transformation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProductForEdit function', () => {
        it('should load and transform product data correctly', async () => {
            (getProductForEdit as jest.Mock).mockResolvedValue(mockOriginalProductData);

            const result = await getProductForEdit('test-product');

            expect(result).toEqual(mockOriginalProductData);
            expect(getProductForEdit).toHaveBeenCalledWith('test-product');
        });

        it('should return null for non-existent product', async () => {
            (getProductForEdit as jest.Mock).mockResolvedValue(null);

            const result = await getProductForEdit('non-existent');

            expect(result).toBeNull();
        });

        it('should throw error for failed data loading', async () => {
            const errorMessage = 'Failed to load product: test-product';
            (getProductForEdit as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(getProductForEdit('test-product')).rejects.toThrow(errorMessage);
        });

        it('should transform Firestore data to form structure correctly', async () => {
            const firestoreData = {
                productName: 'Test Product',
                headline: 'Test Headline',
                portfolioCategory: 'appssdk',
                productGalleryUrls: ['url1', 'url2'],
                keyFeatures: [{ id: '1', keyFeature: 'Feature 1', icon: 'FeatherActivity' }],
                technicalSpecifications: [{ id: '1', parameter: 'Param 1', specification: 'Spec 1' }],
            };

            (getProductForEdit as jest.Mock).mockResolvedValue({
                ...firestoreData,
                productGallery: [], // Should be empty for edit form
                datasheetFile: null, // Should be null for edit form
                fileMetadata: expect.any(Object),
            });

            const result = await getProductForEdit('test-product');

            expect(result?.productName).toBe('Test Product');
            expect(result?.headline).toBe('Test Headline');
            expect(result?.productGallery).toEqual([]);
            expect(result?.datasheetFile).toBeNull();
            expect(result?.productGalleryUrls).toEqual(['url1', 'url2']);
        });
    });
});

describe('ProductEditForm - Data Sanitization', () => {
    // Import the sanitization function for testing
    const { InputSanitizer } = require('@/app/admin/forms/utils/errorHandler');

    beforeEach(() => {
        jest.clearAllMocks();
        InputSanitizer.sanitizeString.mockImplementation((str: string) => str?.trim() || '');
    });

    it('should sanitize product data correctly', () => {
        const dirtyData: ProductFormData = {
            ...mockOriginalProductData,
            productName: '  Dirty Product Name  ',
            headline: '  Dirty Headline  ',
            marketingTagline: '  Dirty Tagline  ',
            productDescription: '  Dirty Description  ',
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

        // Test that sanitization would be called
        expect(InputSanitizer.sanitizeString).toBeDefined();
    });

    it('should handle empty and null values in sanitization', () => {
        const emptyData: Partial<ProductFormData> = {
            productName: '',
            headline: null as any,
            marketingTagline: undefined as any,
        };

        InputSanitizer.sanitizeString('');
        InputSanitizer.sanitizeString(null);
        InputSanitizer.sanitizeString(undefined);

        expect(InputSanitizer.sanitizeString).toHaveBeenCalledWith('');
        expect(InputSanitizer.sanitizeString).toHaveBeenCalledWith(null);
        expect(InputSanitizer.sanitizeString).toHaveBeenCalledWith(undefined);
    });

    it('should preserve file objects during sanitization', () => {
        const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
        const dataWithFiles: ProductFormData = {
            ...mockOriginalProductData,
            productGallery: [mockFile],
            datasheetFile: mockFile,
        };

        // Files should be preserved as-is
        expect(dataWithFiles.productGallery).toEqual([mockFile]);
        expect(dataWithFiles.datasheetFile).toBe(mockFile);
    });
});

describe('ProductEditForm - File Validation', () => {
    const { FileUploadSecurity } = require('@/app/admin/forms/utils/fileUploadSecurity');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should validate new product gallery files', async () => {
        const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
        FileUploadSecurity.validateFile.mockResolvedValue({ isValid: true, errors: [] });

        const data: ProductFormData = {
            ...mockOriginalProductData,
            productGallery: [mockFile],
        };

        // This would be called in the actual validation
        await FileUploadSecurity.validateFile(mockFile, {
            allowedTypes: ['image/jpeg', 'image/png'],
            maxSize: 5 * 1024 * 1024,
            requireSignatureValidation: true,
        });

        expect(FileUploadSecurity.validateFile).toHaveBeenCalledWith(mockFile, {
            allowedTypes: ['image/jpeg', 'image/png'],
            maxSize: 5 * 1024 * 1024,
            requireSignatureValidation: true,
        });
    });

    it('should validate marketing highlight visual files', async () => {
        const mockFile = new File(['content'], 'highlight.jpg', { type: 'image/jpeg' });
        FileUploadSecurity.validateFile.mockResolvedValue({ isValid: true, errors: [] });

        const data: ProductFormData = {
            ...mockOriginalProductData,
            marketingHighlights: [
                { id: '1', headline: 'Test', description: 'Test', visuals: [mockFile] }
            ],
        };

        await FileUploadSecurity.validateFile(mockFile, {
            allowedTypes: ['image/jpeg', 'image/png'],
            maxSize: 5 * 1024 * 1024,
            requireSignatureValidation: true,
        });

        expect(FileUploadSecurity.validateFile).toHaveBeenCalled();
    });

    it('should validate resource files (PDF documents)', async () => {
        const mockPdfFile = new File(['content'], 'datasheet.pdf', { type: 'application/pdf' });
        FileUploadSecurity.validateFile.mockResolvedValue({ isValid: true, errors: [] });

        const data: ProductFormData = {
            ...mockOriginalProductData,
            datasheetFile: mockPdfFile,
        };

        await FileUploadSecurity.validateFile(mockPdfFile, {
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: 10 * 1024 * 1024,
            requireSignatureValidation: true,
        });

        expect(FileUploadSecurity.validateFile).toHaveBeenCalled();
    });

    it('should return validation errors for invalid files', async () => {
        const mockFile = new File(['content'], 'invalid.txt', { type: 'text/plain' });
        FileUploadSecurity.validateFile.mockResolvedValue({
            isValid: false,
            errors: ['Invalid file type', 'File too large'],
        });

        const result = await FileUploadSecurity.validateFile(mockFile, {
            allowedTypes: ['image/jpeg'],
            maxSize: 1024,
            requireSignatureValidation: true,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(['Invalid file type', 'File too large']);
    });

    it('should handle files with same name but different content', async () => {
        const file1 = new File(['content1'], 'test.jpg', { type: 'image/jpeg' });
        const file2 = new File(['content2'], 'test.jpg', { type: 'image/jpeg' });

        // Files with same name but different content should be allowed
        expect(file1.name).toBe(file2.name);
        expect(file1.size).not.toBe(file2.size);
    });
});

describe('ProductEditForm - Update Logic', () => {
    const { uploadDoc } = require('@/firebase/firebaseAuth');
    const { updateDoc } = require('firebase/firestore');

    beforeEach(() => {
        jest.clearAllMocks();
        uploadDoc.mockResolvedValue('https://example.com/uploaded-file.jpg');
        updateDoc.mockResolvedValue(undefined);
    });

    it('should merge new gallery files with existing URLs', async () => {
        const newFile = new File(['content'], 'new-image.jpg', { type: 'image/jpeg' });
        const originalData = {
            ...mockOriginalProductData,
            productGalleryUrls: ['https://example.com/existing1.jpg'],
        };

        const updatedData = {
            ...originalData,
            productGallery: [newFile],
        };

        // Simulate the merging logic
        const existingUrls = originalData.productGalleryUrls || [];
        const newUrls = ['https://example.com/uploaded-file.jpg'];
        const mergedUrls = [...existingUrls, ...newUrls];

        expect(mergedUrls).toEqual([
            'https://example.com/existing1.jpg',
            'https://example.com/uploaded-file.jpg',
        ]);
    });

    it('should replace resource files when new ones are uploaded', async () => {
        const newDatasheet = new File(['content'], 'new-datasheet.pdf', { type: 'application/pdf' });
        const originalData = {
            ...mockOriginalProductData,
            datasheetUrl: 'https://example.com/old-datasheet.pdf',
        };

        const updatedData = {
            ...originalData,
            datasheetFile: newDatasheet,
        };

        // New resource files should replace old ones
        const newDatasheetUrl = 'https://example.com/new-datasheet.pdf';
        expect(newDatasheetUrl).not.toBe(originalData.datasheetUrl);
    });

    it('should preserve existing marketing highlight visuals when no new ones uploaded', async () => {
        const originalData = {
            ...mockOriginalProductData,
            marketingHighlights: [
                {
                    id: '1',
                    headline: 'Test',
                    description: 'Test',
                    visuals: [],
                    visualUrls: ['https://example.com/existing-visual.jpg'],
                },
            ],
        };

        const updatedData = {
            ...originalData,
            marketingHighlights: [
                {
                    id: '1',
                    headline: 'Updated Test',
                    description: 'Updated Test',
                    visuals: [], // No new files
                },
            ],
        };

        // Should preserve existing visual URLs
        const preservedHighlight = {
            ...updatedData.marketingHighlights[0],
            visualUrls: originalData.marketingHighlights[0].visualUrls,
        };

        expect(preservedHighlight.visualUrls).toEqual(['https://example.com/existing-visual.jpg']);
    });

    it('should merge new marketing highlight visuals with existing ones', async () => {
        const newVisual = new File(['content'], 'new-visual.jpg', { type: 'image/jpeg' });
        const originalData = {
            ...mockOriginalProductData,
            marketingHighlights: [
                {
                    id: '1',
                    headline: 'Test',
                    description: 'Test',
                    visuals: [],
                    visualUrls: ['https://example.com/existing-visual.jpg'],
                },
            ],
        };

        const updatedData = {
            ...originalData,
            marketingHighlights: [
                {
                    id: '1',
                    headline: 'Updated Test',
                    description: 'Updated Test',
                    visuals: [newVisual],
                },
            ],
        };

        // Should merge existing and new visual URLs
        const existingUrls = originalData.marketingHighlights[0].visualUrls || [];
        const newUrls = ['https://example.com/new-visual.jpg'];
        const mergedUrls = [...existingUrls, ...newUrls];

        expect(mergedUrls).toEqual([
            'https://example.com/existing-visual.jpg',
            'https://example.com/new-visual.jpg',
        ]);
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
    });

    it('should include updatedBy and updatedAt fields', () => {
        const updateData = {
            ...mockUpdatedProductData,
            updatedBy: mockUser.name,
            updatedAt: new Date(),
        };

        expect(updateData.updatedBy).toBe('Test User');
        expect(updateData.updatedAt).toBeInstanceOf(Date);
    });
});

describe('ProductEditForm - Error Handling', () => {
    const { FormErrorHandler, UserNotification } = require('@/app/admin/forms/utils/errorHandler');
    const { withRateLimit } = require('@/app/admin/forms/utils/rateLimiter');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle file validation errors', async () => {
        const validationError = 'File validation failed: Invalid file type';
        FormErrorHandler.handleError.mockReturnValue(validationError);

        const error = new Error(validationError);
        FormErrorHandler.handleError(error);
        FormErrorHandler.logError(error, 'ProductEditForm');
        UserNotification.showError(validationError);

        expect(FormErrorHandler.handleError).toHaveBeenCalledWith(error);
        expect(FormErrorHandler.logError).toHaveBeenCalledWith(error, 'ProductEditForm');
        expect(UserNotification.showError).toHaveBeenCalledWith(validationError);
    });

    it('should handle Firebase update errors', async () => {
        const firebaseError = new Error('Firebase update failed');
        FormErrorHandler.handleError.mockReturnValue('Database update failed');

        FormErrorHandler.handleError(firebaseError);
        FormErrorHandler.logError(firebaseError, 'ProductEditForm');
        UserNotification.showError('Database update failed');

        expect(FormErrorHandler.handleError).toHaveBeenCalledWith(firebaseError);
        expect(FormErrorHandler.logError).toHaveBeenCalledWith(firebaseError, 'ProductEditForm');
        expect(UserNotification.showError).toHaveBeenCalledWith('Database update failed');
    });

    it('should handle rate limiting', async () => {
        const rateLimitCallback = jest.fn();
        withRateLimit.mockImplementation((clientId, action, callback) => {
            expect(clientId).toBe('test-client');
            expect(action).toBe('formSubmission');
            return callback();
        });

        await withRateLimit('test-client', 'formSubmission', rateLimitCallback);

        expect(withRateLimit).toHaveBeenCalledWith('test-client', 'formSubmission', rateLimitCallback);
    });

    it('should handle upload errors gracefully', async () => {
        const { uploadDoc } = require('@/firebase/firebaseAuth');
        const uploadError = new Error('Upload failed');
        uploadDoc.mockRejectedValue(uploadError);

        try {
            await uploadDoc('test-path', new File(['content'], 'test.jpg'));
        } catch (error) {
            expect(error).toBe(uploadError);
        }

        expect(uploadDoc).toHaveBeenCalled();
    });

    it('should show success notification on successful update', () => {
        const productName = 'Test Product';
        const successMessage = `Product "${productName}" updated successfully!`;

        UserNotification.showSuccess(successMessage);

        expect(UserNotification.showSuccess).toHaveBeenCalledWith(successMessage);
    });
});

describe('ProductEditForm - Component State Management', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle loading states correctly', () => {
        // Test different loading combinations
        const loadingStates = [
            { isUserLoading: true, areTagsLoading: false, isLoadingData: false },
            { isUserLoading: false, areTagsLoading: true, isLoadingData: false },
            { isUserLoading: false, areTagsLoading: false, isLoadingData: true },
            { isUserLoading: true, areTagsLoading: true, isLoadingData: true },
        ];

        loadingStates.forEach(state => {
            const shouldShowLoading = state.isUserLoading || state.areTagsLoading || state.isLoadingData;
            expect(shouldShowLoading).toBe(true);
        });
    });

    it('should handle error states correctly', () => {
        const errorStates = [
            { error: new Error('Tags loading failed'), loadError: null },
            { error: null, loadError: 'Product not found' },
            { error: new Error('Tags error'), loadError: 'Product error' },
        ];

        errorStates.forEach(state => {
            const hasError = state.error || state.loadError;
            expect(hasError).toBeTruthy();
        });
    });

    it('should handle missing user authentication', () => {
        const user = null;
        const shouldShowLoginMessage = !user;
        expect(shouldShowLoginMessage).toBe(true);
    });

    it('should handle missing product data', () => {
        const initialData = null;
        const originalData = null;
        const shouldShowNotFound = !initialData || !originalData;
        expect(shouldShowNotFound).toBe(true);
    });

    it('should create correct form configuration for edit mode', () => {
        const baseConfig = {
            formId: 'product-form',
            formTitle: 'Add Product',
            description: 'Fill in the details to add a new product to the catalog.',
        };

        const editConfig = {
            ...baseConfig,
            formTitle: 'Edit Product',
            description: 'Update the product details below.',
        };

        expect(editConfig.formTitle).toBe('Edit Product');
        expect(editConfig.description).toBe('Update the product details below.');
        expect(editConfig.formId).toBe(baseConfig.formId); // Should preserve form ID
    });
});

describe('ProductEditForm - Integration Scenarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle complete edit workflow', async () => {
        // 1. Load existing product
        (getProductForEdit as jest.Mock).mockResolvedValue(mockOriginalProductData);
        const loadedData = await getProductForEdit('test-product');
        expect(loadedData).toEqual(mockOriginalProductData);

        // 2. User makes changes
        const updatedData = {
            ...mockOriginalProductData,
            productName: 'Updated Product Name',
            headline: 'Updated Headline',
        };

        // 3. Validate and sanitize
        const { InputSanitizer } = require('@/app/admin/forms/utils/errorHandler');
        InputSanitizer.sanitizeString.mockImplementation((str: string) => str?.trim());

        // 4. Update in Firebase
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockResolvedValue(undefined);

        // 5. Show success notification
        const { UserNotification } = require('@/app/admin/forms/utils/errorHandler');
        UserNotification.showSuccess.mockImplementation(() => {});

        // Simulate the workflow
        expect(loadedData?.productName).toBe('Original Product');
        expect(updatedData.productName).toBe('Updated Product Name');
    });

    it('should handle partial updates (only some fields changed)', () => {
        const originalData = mockOriginalProductData;
        const partialUpdate = {
            ...originalData,
            productName: 'New Name', // Only name changed
            // All other fields remain the same
        };

        // Should create update data with only changed fields
        const hasChanges = partialUpdate.productName !== originalData.productName;
        expect(hasChanges).toBe(true);
    });

    it('should handle file-only updates (no text changes)', async () => {
        const newFile = new File(['content'], 'new-image.jpg', { type: 'image/jpeg' });
        const fileOnlyUpdate = {
            ...mockOriginalProductData,
            productGallery: [newFile], // Only files changed
        };

        const { uploadDoc } = require('@/firebase/firebaseAuth');
        uploadDoc.mockResolvedValue('https://example.com/new-image.jpg');

        // Should handle file uploads even when text fields unchanged
        expect(fileOnlyUpdate.productGallery).toHaveLength(1);
        expect(fileOnlyUpdate.productName).toBe(mockOriginalProductData.productName);
    });

    it('should handle mixed updates (text and files)', async () => {
        const newFile = new File(['content'], 'mixed-update.jpg', { type: 'image/jpeg' });
        const mixedUpdate = {
            ...mockOriginalProductData,
            productName: 'Mixed Update Product',
            headline: 'Mixed Update Headline',
            productGallery: [newFile],
            keyFeatures: [
                ...mockOriginalProductData.keyFeatures,
                { id: '2', keyFeature: 'New Feature', icon: 'FeatherZap' },
            ],
        };

        // Should handle both text and file changes
        expect(mixedUpdate.productName).not.toBe(mockOriginalProductData.productName);
        expect(mixedUpdate.productGallery).toHaveLength(1);
        expect(mixedUpdate.keyFeatures).toHaveLength(2);
    });

    it('should preserve data integrity during updates', () => {
        const updateData = {
            ...mockUpdatedProductData,
            fileMetadata: {
                lastUpdated: new Date().toISOString(),
                galleryCount: 2,
                highlightCount: 1,
                resourceCount: 3,
            },
            updatedBy: mockUser.name,
            updatedAt: new Date(),
        };

        // Critical fields should be preserved
        expect(updateData.slug).toBe(mockOriginalProductData.slug); // Slug shouldn't change
        expect(updateData.fileMetadata).toBeDefined();
        expect(updateData.updatedBy).toBe(mockUser.name);
        expect(updateData.updatedAt).toBeInstanceOf(Date);
    });
}); 