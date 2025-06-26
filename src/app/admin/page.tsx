'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FeatherBug, FeatherList, FeatherLogOut, FeatherPlus, FeatherPower, FeatherUpload, FeatherX } from "@subframe/core";
import { db } from "@/firebase/firebaseconfig";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { uploadDoc, makeAuthenticatedRequest, getAuthToken } from "@/firebase/firebaseAuth";
import { createSlug } from "@/utils/Utils";
import { FormErrorHandler, UserNotification, InputSanitizer } from "@/app/admin/forms/utils/errorHandler";
import { RateLimiter, withRateLimit, RateLimitType } from "@/app/admin/forms/utils/rateLimiter";
import { FileUploadSecurity, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from "@/app/admin/forms/utils/fileUploadSecurity";
import { useAuthContext } from "@/context/AuthContext";
import { getDisplayName, getDatabaseIdentity } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Image from "next/image";

import { BadgeConsort, Button3, RadioCardGroup } from "@/ui";
import { DashboardSkeleton } from '@/app/admin/forms/components/shared/layout/DashboardSkeleton';
import { TagCard } from "@/components/admin/TagCard";

const TAG_CONFIG = {
    'global-tags': {
        collectionName: 'global-tags',
        storagePath: 'general/tags/global',
        hasImage: false,
        label: 'Global Tags',
    },
    'clients': {
        collectionName: 'clients',
        storagePath: 'general/tags/clients',
        hasImage: true,
        label: 'Clients',
    },
    'product-brands': {
        collectionName: 'product-brands',
        storagePath: 'general/tags/brands',
        hasImage: true,
        label: 'Product Brands',
    },
    'icons': {
        collectionName: 'icons',
        storagePath: 'general/tags/icons',
        hasImage: true,
        label: 'Icons',
    },
};

const modules = [
    {
        title: "Posts",
        stats: ["Events", "News", "Announcements", "Blog Posts"],
        route: "/admin/posts",
        list: "/admin/list-details?type=posts",
    },
    {
        title: "Resources",
        stats: ["Case Studies", "Whitepapers", "Customer Reviews"],
        route: "/admin/resources",
        list: "/admin/list-details?type=resources",
    },
    {
        title: "Solutions",
        stats: ["Solutions"],
        route: "/admin/solutions",
        list: "/admin/list-details?type=solutions",
    },
    {
        title: "Products",
        stats: ["Products"],
        route: "/admin/products/form",
        list: "/admin/list-details?type=products",
    },
    {
        title: "Industries",
        stats: ["Industries"],
        route: "/admin/industries",
        list: "/admin/list-details?type=industries",
    },
    {
        title: "Tag System",
        stats: ["Icons", "Global Tags", "Client Logos", "Product Brands"],
        route: "/admin/career/form-new",
        list: "/admin/tag-system",
    },
    {
        title: "Career",
        stats: ["Active Job Posts", "Archived"],
        route: "/admin/career/form-new",
        list: "/admin/list-details?type=career",
    },
];

function AdminDashboard() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTagType, setSelectedTagType] = useState<keyof typeof TAG_CONFIG | "">("");
    const [label, setLabel] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [counts, setCounts] = useState<Record<string, Record<string, number>>>({});
    const { user, loading, logout, isAuthenticated } = useAuthContext();
    const router = useRouter();

    // Security check at component level
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            console.log('[ADMIN] Unauthorized access attempt detected - redirecting');
            router.replace('/auth');
            return;
        }
    }, [loading, isAuthenticated, router]);

    // Additional security: verify user has required fields
    useEffect(() => {
        if (!loading && user && (!user.uid || !user.email)) {
            console.log('[ADMIN] Invalid user session detected - redirecting');
            router.replace('/auth');
            return;
        }
    }, [loading, user, router]);

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && label.trim() !== '') {
            e.preventDefault();
            const newTag = label.trim();

            // Security: Limit tag length to prevent abuse
            if (newTag.length > 50) {
                UserNotification.showError("Tag name cannot exceed 50 characters.");
                return;
            }

            if (tags.length < 10 && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setLabel('');
            } else if (tags.includes(newTag)) {
                UserNotification.showError("This tag has already been added.");
            } else {
                UserNotification.showError("You can add up to 10 tags at a time.");
            }
        }
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    const handlePublish = async () => {
        const context = 'TagModal';
        const clientId = RateLimiter.getClientIdentifier();

        if (!selectedTagType) {
            UserNotification.showError("Please select a tag type.");
            return;
        }

        setIsSubmitting(true);

        try {
            await withRateLimit(clientId, 'tagSubmission' as RateLimitType, async () => {
                console.log(`[SECURITY] Admin action: ${user?.email} creating ${selectedTagType} tags`);

                if (selectedTagType === 'global-tags') {
                    if (tags.length === 0) {
                        throw new Error("Please add at least one tag to publish.");
                    }
                    const batch = writeBatch(db);
                    const collectionName = TAG_CONFIG['global-tags'].collectionName;

                    tags.forEach(tag => {
                        const sanitizedLabel = InputSanitizer.sanitizeString(tag);
                        if (sanitizedLabel) {
                            const slug = createSlug(sanitizedLabel);
                            const docRef = doc(db, collectionName, slug);
                            batch.set(docRef, {
                                label: sanitizedLabel,
                                slug,
                                createdAt: new Date().toISOString(),
                                createdBy: getDatabaseIdentity(user),
                                updatedBy: getDatabaseIdentity(user),
                                updatedAt: new Date().toISOString(),
                            });
                        }
                    });

                    await batch.commit();
                } else {
                    if (!label) {
                        throw new Error("Please enter a label.");
                    }

                    const config = TAG_CONFIG[selectedTagType as keyof typeof TAG_CONFIG];
                    if (!config) {
                        throw new Error("Invalid tag type selected.");
                    }

                    if (config.hasImage && !file) {
                        throw new Error(`An image is required for ${config.label}.`);
                    }

                    const sanitizedLabel = InputSanitizer.sanitizeString(label);
                    if (!sanitizedLabel) {
                        throw new Error("Label cannot be empty after sanitization.");
                    }
                    const slug = createSlug(sanitizedLabel);
                    let imageUrl = "";

                    if (config.hasImage && file) {
                        const validation = await FileUploadSecurity.validateFile(file, {
                            allowedTypes: [...ALLOWED_FILE_TYPES.images],
                            maxSize: FILE_SIZE_LIMITS.image,
                            requireSignatureValidation: true,
                        });

                        if (!validation.isValid) {
                            throw new Error(`File validation failed for "${file.name}": ${validation.errors.join(', ')}`);
                        }

                        imageUrl = await uploadDoc(`${config.storagePath}/${slug}`, file);
                    }

                    const docData = {
                        label: sanitizedLabel,
                        slug,
                        createdAt: new Date().toISOString(),
                        createdBy: getDatabaseIdentity(user),
                        updatedBy: getDatabaseIdentity(user),
                        updatedAt: new Date().toISOString(),
                        ...(imageUrl && { imageUrl }),
                    };

                    await setDoc(doc(db, config.collectionName, slug), docData);
                }
            });

            // Show success message AFTER the rate-limited operation succeeds
            if (selectedTagType === 'global-tags') {
                UserNotification.showSuccess(`${tags.length} tags published successfully!`);
            } else {
                UserNotification.showSuccess(`Tag "${label}" published successfully!`);
            }

            // Reset form state after successful submission
            setTags([]);
            setLabel('');
            setFile(null);
            setIsOpen(false);
        } catch (error) {
            const formError = FormErrorHandler.handleError(error);
            FormErrorHandler.logError(error, context);
            UserNotification.showError(formError);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Secure API call function with fallback for development
    const makeSecureApiCall = async (url: string, options: RequestInit = {}) => {
        if (!isAuthenticated) {
            console.error('[ADMIN] Attempted API call without authentication');
            throw new Error('Authentication required');
        }

        try {
            const response = await makeAuthenticatedRequest(url, options);
            
            // Handle authentication failures
            if (response.status === 401) {
                throw new Error('Session expired - please refresh the page');
            }
            
            return response;
        } catch (error) {
            console.error('[ADMIN] Secure API call failed:', error);
            
            // If it's a network error, provide helpful message
            if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('ERR_TOO_MANY_REDIRECTS'))) {
                throw new Error('Network error - API endpoint may not be properly configured. Check Firebase Admin SDK environment variables.');
            }
            
            throw error;
        }
    };

    useEffect(() => {  
        let isMounted = true;
        let fetchTimeout: NodeJS.Timeout;
        
        async function fetchCounts() {
            if (!isAuthenticated || !isMounted) {
                return;
            }

            try {
    
                
                const response = await makeSecureApiCall('/api/admin/dashboard-data', {
                    method: 'GET',
                });

                if (!isMounted) return; // Prevent state update if component unmounted

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Failed to fetch dashboard data`);
                }

                const result = await response.json();
                if (result.success) {
                    setCounts(result.data);
    
                } else {
                    console.error('[ADMIN] API returned error:', result.error);
                    setCounts({});
                }
            } catch (error) {
                if (!isMounted) return;
                
                console.error('[ADMIN] ❌ Error fetching dashboard data:', error);
                setCounts({});
                
                // Let the AuthGuard handle redirects - don't redirect from here
                // This prevents redirect loops during API calls
            }
        }

        // Debounce the API call to prevent rapid repeated requests
        if (isAuthenticated) {
            fetchTimeout = setTimeout(() => {
                if (isMounted) {
                    fetchCounts();
                }
            }, 100); // 100ms debounce
        }

        // Cleanup function
        return () => {
            isMounted = false;
            if (fetchTimeout) {
                clearTimeout(fetchTimeout);
            }
        };
    }, [isAuthenticated]); // FIXED: Removed router dependency that was causing repeated calls

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <main className="bg-neutral-100">
            <div className="flex w-full max-w-[1280px] mx-auto h-screen flex-col justify-between">
                <div className="flex flex-col grow gap-8 pt-8">
                    <div className="flex w-full items-center gap-1 p-6">
                        <div className="flex grow flex-col items-center">
                            <span className="w-full text-heading-2 font-heading-2 text-default-font mb-1">
                                Hello {getDisplayName(user)}!
                            </span>
                            <span className="pl-0.5 w-full text-body-lg font-body-xl text-subtext-color">
                                Welcome to Consort&apos;s CMS Admin
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Image
                                alt="Consort Logo"
                                width={200}
                                height={200}
                                className="max-w-[256px] h-6 w-auto flex-none"
                                src="/consort-blue.svg"
                            />
                            <div className="h-[24px] w-[1px] mx-2 bg-neutral-300" />
                            <Button3
                                variant="black"
                                className="rounded-sm !bg-brand-900 hover:!bg-consort-red/50"
                                size="large"
                                icon={<FeatherPower />}
                                onClick={() => {
                                    if (confirm("Are you sure you want to logout?")) {
                                        user && logout();
                                    }
                                }}
                            >

                            </Button3>


                        </div>
                    </div>

                    <div className="flex w-full flex-wrap gap-4">
                        {modules.map((mod, idx) => (
                            <div
                                key={idx}
                                className="admin-card flex min-h-[280px] grow flex-col items-start justify-between gap-6 self-stretch rounded-2xl bg-default-background px-8 py-8 shadow-md transition-all duration-500 ease-in-out hover:bg-gradient-to-br hover:from-blue-100 hover:to-amber-50"
                            >
                                <div className="flex w-full gap-4">
                                    <div className="flex flex-col gap-3 px-1 py-1">
                                        <span className="pl-2.5 font-['Manrope'] text-[30px] font-[600] leading-[40px] text-default-font">
                                            {mod.title}
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            {mod.stats.map((label, i) => (
                                                <div key={i} className="flex items-center gap-1.5">
                                                    <span className="text-body font-body text-subtext-color">- {label}</span>
                                                    <BadgeConsort variant="neutral" variant2="small">{counts[mod.title]?.[label] || 0}</BadgeConsort>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pl-2.5">
                                    {mod.list === '/admin/tag-system' ? <Button3
                                        className="rounded-3xl"
                                        variant="black"
                                        size="small"
                                        iconRight={<FeatherPlus />}
                                        onClick={() => setIsOpen(true)}
                                    >
                                        Dialog Box
                                    </Button3> : <Button3
                                        className="rounded-3xl"
                                        variant="black"
                                        size="small"
                                        iconRight={<FeatherPlus />}
                                        onClick={() => router.push(mod.route)}
                                    >
                                        Add New
                                    </Button3>}

                                    <Button3
                                        className="rounded-3xl"
                                        variant="neutral-tertiary"
                                        size="small"
                                        iconRight={<FeatherList />}
                                        onClick={() => router.push(mod.list)}
                                    >
                                        Published
                                    </Button3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex w-full items-center justify-between p-3">
                    <span className="text-caption font-caption text-default-font">
                        Custom Dashboard for Consort Digital Website Content Management
                    </span>
                    <Button3 variant="neutral-tertiary" icon={<FeatherBug />}>Report Bugs</Button3>
                </div>

                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) {
                            setSelectedTagType('');
                            setLabel('');
                            setFile(null);
                            setTags([]);
                        }
                    }}
                >
                    <DialogContent className="max-w-[760px]">
                        <DialogHeader>
                            <DialogTitle className="text-body-xl font-body-xl text-default-font">Tag Management</DialogTitle>
                            <DialogDescription className="text-body font-body text-subtext-color">
                                Select the type of Tag Entity you want to add
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
                            <RadioCardGroup
                                value={selectedTagType}
                                onValueChange={(value: string) => setSelectedTagType(value as keyof typeof TAG_CONFIG | '')}
                            >
                                <div className="grid grid-cols-4 gap-1">
                                    <RadioCardGroup.RadioCard value="global-tags">
                                        <div className="flex flex-col items-start pr-2">
                                            <span className="text-caption-bold font-body-bold !leading-tight  text-consort-blue">Global Tags</span>
                                            {/* <span className="text-caption font-caption text-subtext-color">Only Text</span> */}
                                        </div>
                                    </RadioCardGroup.RadioCard>

                                    <RadioCardGroup.RadioCard value="clients">
                                        <div className="flex flex-col items-start pr-2">
                                            <span className="text-caption-bold font-body-bold !leading-tight  text-consort-blue">Clients</span>
                                            {/* <span className="text-caption font-caption text-subtext-color">Logo &amp; Name</span> */}
                                        </div>
                                    </RadioCardGroup.RadioCard>

                                    <RadioCardGroup.RadioCard value="product-brands">
                                        <div className="flex flex-col items-start pr-2">
                                            <span className="text-caption-bold font-body-bold !leading-tight text-consort-blue">
                                                Brands
                                            </span>
                                            {/* <span className="text-caption font-caption text-subtext-color">Logo &amp; Name</span> */}
                                        </div>
                                    </RadioCardGroup.RadioCard>

                                    <RadioCardGroup.RadioCard value="icons">
                                        <div className="flex flex-col items-start pr-2">
                                            <span className="text-caption-bold font-body-bold !leading-tight  text-consort-blue">Icons</span>
                                            {/* <span className="text-caption font-caption text-subtext-color">Icon &amp; Name</span> */}
                                        </div>
                                    </RadioCardGroup.RadioCard>
                                </div>
                            </RadioCardGroup>

                            {selectedTagType === 'global-tags' && (
                                <div className="mt-6 flex w-full flex-col gap-4">
                                    <div>
                                        <label htmlFor="tag-input" className="text-body-bold font-body-bold text-default-font">
                                            Add Tags (up to 10)
                                        </label>
                                        <div className="my-2 flex flex-wrap gap-2">
                                            {tags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 rounded-full bg-neutral-200 px-3 py-1"
                                                >
                                                    <span className="text-body font-body text-default-font">{tag}</span>
                                                    <button
                                                        onClick={() => removeTag(index)}
                                                        className="text-subtext-color hover:text-default-font"
                                                    >
                                                        <FeatherX />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <Input
                                            value={label}
                                            onChange={(e) => setLabel(e.target.value)}
                                            onKeyDown={handleTagInputKeyDown}
                                            placeholder="Enter tag name and press Enter"
                                            disabled={isSubmitting || tags.length >= 10}
                                            maxLength={50}
                                        />
                                        {tags.length >= 10 && (
                                            <span className="text-caption font-caption text-red-500">
                                                You have reached the limit of 10 tags.
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex h-px w-full bg-neutral-border" />

                                    <div className="flex w-full items-center justify-between">
                                        <Button3 onClick={handlePublish} disabled={isSubmitting || tags.length === 0}>
                                            {isSubmitting ? 'Publishing...' : `Publish ${tags.length} Tags`}
                                        </Button3>
                                        <Button3
                                            variant="destructive-tertiary"
                                            onClick={() => setIsOpen(false)}
                                            disabled={isSubmitting}
                                        >
                                            Close
                                        </Button3>
                                    </div>
                                </div>
                            )}

                            {selectedTagType && selectedTagType !== 'global-tags' && (
                                <div className="mt-6 flex w-full flex-col gap-6">

                                    {/* Label + Input Side-by-Side */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <label className="w-[120px] min-w-[100px] text-right text-body-bold font-body-bold text-default-font">
                                            Tag / Company:
                                        </label>
                                        <div className="flex-1 min-w-[200px]">
                                            <Input
                                                value={label}
                                                onChange={(e) => setLabel(e.target.value)}
                                                placeholder="Enter tag name"
                                                disabled={isSubmitting}
                                                maxLength={50}
                                            />
                                        </div>
                                    </div>

                                    {/* Label + Upload */}
                                    {TAG_CONFIG[selectedTagType as keyof typeof TAG_CONFIG].hasImage && (
                                        <div className="flex flex-wrap items-center gap-4">
                                            <label className="w-[120px] min-w-[100px] text-right text-body-bold font-body-bold text-default-font">
                                                Icon / Logo:
                                            </label>
                                            <div className="flex-1 flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="file"
                                                        id="tag-file-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const selectedFile = e.target.files?.[0];
                                                            if (selectedFile) setFile(selectedFile);
                                                        }}
                                                    />
                                                    <Button3
                                                        variant="neutral-secondary"
                                                        icon={<FeatherUpload />}
                                                        onClick={() => document.getElementById('tag-file-upload')?.click()}
                                                        disabled={isSubmitting}
                                                    >
                                                        Upload
                                                    </Button3>
                                                    {file && (
                                                        <span className="text-caption font-caption text-subtext-color truncate max-w-[200px]">
                                                            {file.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-caption font-caption text-subtext-color">Upload: 64x64px</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="h-px w-full bg-neutral-border" />

                                    {/* Actions */}
                                    <div className="flex w-full items-center justify-between">
                                        <Button3 onClick={handlePublish} disabled={isSubmitting}>
                                            {isSubmitting ? 'Publishing...' : 'Publish'}
                                        </Button3>
                                        <Button3
                                            variant="destructive-tertiary"
                                            onClick={() => setIsOpen(false)}
                                            disabled={isSubmitting}
                                        >
                                            Close
                                        </Button3>
                                    </div>
                                </div>

                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </main>
    );
}

export default function AdminPage() {
    return <AdminDashboard />;
}
