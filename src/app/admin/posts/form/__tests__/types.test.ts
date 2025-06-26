import { PostFormData, PostSectionItem } from '../../types';

describe('PostForm Types', () => {
    describe('PostSectionItem Interface', () => {
        it('should accept valid PostSectionItem data', () => {
            const validSection: PostSectionItem = {
                id: 'section-1',
                sectionTitle: 'Test Section',
                sectionContent: 'Test content',
                sectionImage: null
            };

            expect(validSection.id).toBe('section-1');
            expect(validSection.sectionTitle).toBe('Test Section');
            expect(validSection.sectionContent).toBe('Test content');
            expect(validSection.sectionImage).toBeNull();
        });

        it('should accept PostSectionItem with File object', () => {
            const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            const sectionWithFile: PostSectionItem = {
                id: 'section-2',
                sectionTitle: 'Section with Image',
                sectionContent: 'Content with image',
                sectionImage: mockFile
            };

            expect(sectionWithFile.sectionImage).toBeInstanceOf(File);
            expect(sectionWithFile.sectionImage?.name).toBe('test.jpg');
        });
    });

    describe('PostFormData Interface', () => {
        it('should accept complete PostFormData', () => {
            const mockFile = new File(['hero'], 'hero.jpg', { type: 'image/jpeg' });
            const mockSectionFile = new File(['section'], 'section.jpg', { type: 'image/jpeg' });

            const completeData: PostFormData = {
                slug: 'test-post',
                postType: 'blog-post',
                industryUseCases: ['industry1', 'industry2'],
                postTitle: 'Test Post Title',
                globalTags: ['tag1', 'tag2'],
                date: '2024-01-15',
                headline: 'Test Headline',
                heroImage: mockFile,
                sections: [
                    {
                        id: 'section-1',
                        sectionTitle: 'First Section',
                        sectionContent: 'First section content',
                        sectionImage: mockSectionFile
                    }
                ],
                clientCompanies: ['client1', 'client2']
            };

            expect(completeData.slug).toBe('test-post');
            expect(completeData.postType).toBe('blog-post');
            expect(completeData.industryUseCases).toHaveLength(2);
            expect(completeData.globalTags).toHaveLength(2);
            expect(completeData.heroImage).toBeInstanceOf(File);
            expect(completeData.sections).toHaveLength(1);
            expect(completeData.clientCompanies).toHaveLength(2);
        });

        it('should accept minimal PostFormData', () => {
            const minimalData: PostFormData = {
                slug: 'minimal-post',
                postType: 'news',
                industryUseCases: [],
                postTitle: 'Minimal Post',
                globalTags: [],
                date: '2024-01-01',
                headline: 'Minimal Headline',
                heroImage: null,
                sections: []
            };

            expect(minimalData.slug).toBe('minimal-post');
            expect(minimalData.postType).toBe('news');
            expect(minimalData.heroImage).toBeNull();
            expect(minimalData.sections).toHaveLength(0);
            expect(minimalData.clientCompanies).toBeUndefined();
        });

        it('should support index signature for Record<string, unknown> compatibility', () => {
            const dataWithExtraFields: PostFormData = {
                slug: 'test-post',
                postType: 'event',
                industryUseCases: ['industry1'],
                postTitle: 'Test Post',
                globalTags: ['tag1'],
                date: '2024-01-01',
                headline: 'Test Headline',
                heroImage: null,
                sections: [],
                // Extra fields for compatibility
                customField: 'custom value',
                anotherField: 123,
                booleanField: true
            };

            expect(dataWithExtraFields.customField).toBe('custom value');
            expect(dataWithExtraFields.anotherField).toBe(123);
            expect(dataWithExtraFields.booleanField).toBe(true);
        });

        it('should validate post types', () => {
            const validPostTypes = ['blog-post', 'news', 'event', 'announcement'];
            
            validPostTypes.forEach(postType => {
                const data: PostFormData = {
                    slug: 'test',
                    postType,
                    industryUseCases: [],
                    postTitle: 'Test',
                    globalTags: [],
                    date: '2024-01-01',
                    headline: 'Test',
                    heroImage: null,
                    sections: []
                };
                expect(data.postType).toBe(postType);
            });
        });

        it('should handle multiple sections correctly', () => {
            const multipleSections: PostSectionItem[] = [
                {
                    id: 'section-1',
                    sectionTitle: 'Introduction',
                    sectionContent: 'Introduction content',
                    sectionImage: null
                },
                {
                    id: 'section-2',
                    sectionTitle: 'Main Content',
                    sectionContent: 'Main content here',
                    sectionImage: new File(['img'], 'main.jpg', { type: 'image/jpeg' })
                },
                {
                    id: 'section-3',
                    sectionTitle: 'Conclusion',
                    sectionContent: 'Conclusion content',
                    sectionImage: null
                }
            ];

            const dataWithMultipleSections: PostFormData = {
                slug: 'multi-section-post',
                postType: 'blog-post',
                industryUseCases: ['tech'],
                postTitle: 'Multi-Section Post',
                globalTags: ['comprehensive'],
                date: '2024-01-15',
                headline: 'A comprehensive post with multiple sections',
                heroImage: null,
                sections: multipleSections
            };

            expect(dataWithMultipleSections.sections).toHaveLength(3);
            expect(dataWithMultipleSections.sections[0].sectionImage).toBeNull();
            expect(dataWithMultipleSections.sections[1].sectionImage).toBeInstanceOf(File);
            expect(dataWithMultipleSections.sections[2].sectionImage).toBeNull();
        });
    });

    describe('Type Compatibility', () => {
        it('should be compatible with Record<string, unknown>', () => {
            const postData: PostFormData = {
                slug: 'compatibility-test',
                postType: 'blog-post',
                industryUseCases: ['industry1'],
                postTitle: 'Compatibility Test',
                globalTags: ['tag1'],
                date: '2024-01-01',
                headline: 'Testing compatibility',
                heroImage: null,
                sections: []
            };

            // This should not cause TypeScript errors
            const record: Record<string, unknown> = postData;
            expect(record.slug).toBe('compatibility-test');
            expect(record.postType).toBe('blog-post');
        });

        it('should handle undefined optional fields gracefully', () => {
            const dataWithUndefinedOptionals: PostFormData = {
                slug: 'test-undefined',
                postType: 'news',
                industryUseCases: [],
                postTitle: 'Test Undefined',
                globalTags: [],
                date: '2024-01-01',
                headline: 'Test',
                heroImage: null,
                sections: [],
                clientCompanies: undefined
            };

            expect(dataWithUndefinedOptionals.clientCompanies).toBeUndefined();
        });
    });
}); 