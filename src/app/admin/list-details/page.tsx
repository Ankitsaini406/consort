'use client';

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase/firebaseconfig";
import * as SubframeCore from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { Button3 } from "@/ui/components/Button3";
import React, { Suspense, useEffect, useState } from "react";
import { AdminContentItem, listConfigurations } from "./list-configrations";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/ui/components/Tabs";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import { collection, getDocs, query, where, Timestamp, doc, setDoc, writeBatch, deleteDoc, updateDoc } from "firebase/firestore";
import {
    FeatherArrowLeft, FeatherDraftingCompass, FeatherCheck, FeatherPlus,
    FeatherListFilter, FeatherSearch, FeatherChevronDown, FeatherChevronLeft, FeatherChevronRight,
    FeatherArrowDownUp, FeatherEdit, FeatherEye, FeatherImage, FeatherFileText, FeatherFile, FeatherSidebar, FeatherX, FeatherUpload
} from "@subframe/core";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { TagCard } from "@/components/admin/TagCard";
import { uploadDoc } from "@/firebase/firebaseAuth";
import { createSlug } from "@/utils/Utils";
import { FormErrorHandler, UserNotification, InputSanitizer } from "@/app/admin/forms/utils/errorHandler";
import { RateLimiter, withRateLimit, RateLimitType } from "@/app/admin/forms/utils/rateLimiter";
import { FileUploadSecurity, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from "@/app/admin/forms/utils/fileUploadSecurity";
import { useUser } from "@/context/userContext";
import { useTags } from "@/context/TagContext";
import { getDisplayName, getDatabaseIdentity } from "@/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";

// Predefined display names for admin users (same as in useAuth.ts)
const ADMIN_DISPLAY_NAMES: Record<string, string> = {
    'admin@consortdigital.com': 'Consort Admin',
    'admin@consort.com': 'Consort Admin',
    // Add more admins as needed:
    // 'john@consort.com': 'John Smith',
    // 'jane@consort.com': 'Jane Doe',
};

// Helper function to convert email to display name for UI
const getDisplayNameFromEmail = (email: string): string => {
    if (ADMIN_DISPLAY_NAMES[email]) {
        return ADMIN_DISPLAY_NAMES[email];
    }
    // Extract name part from email and capitalize
    return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
};

// Tag configuration - updated paths for security compliance
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
};

// A robust function to safely get a date from various possible formats
const toDate = (date: unknown): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (date instanceof Timestamp) return date.toDate();
    if (typeof date === 'string') {
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof date === 'number') { // Handle Unix timestamps (seconds or ms)
        return new Date(date * 1000);
    }
    return null;
};

type RawDoc = { [key: string]: unknown }; // Use unknown for better type safety

// The new data mapper function to normalize different data structures
const mapToAdminContentItem = (doc: { id: string; data: () => RawDoc }, docType: string): AdminContentItem => {
    const data = doc.data();
    return {
        id: doc.id,
        slug: (data.slug as string) || doc.id,
        docType: docType,

        // Titles
        postTitle: data.postTitle as string,
        resourceTitle: data.resourceTitle as string,
        productName: data.productName as string,
        solutionName: data.solutionName as string,
        solutionTitle: data.solutionTitle as string, // Transformed solution title
        industryName: data.industryName as string,
        label: (data.label as string) || (data.name as string),

        // Subheadings
        headline: data.headline as string,
        productBrief: data.productBrief as string,
        solutionOverview: data.solutionOverview as string,
        industryOverview: data.industryOverview as string,
        marketingTagline: data.marketingTagline as string,

        // Post-specific fields
        date: data.date as string,
        industryUseCases: data.industryUseCases as string[],
        globalTags: data.globalTags as string[],
        clientCompanies: data.clientCompanies as string[],
        sections: data.sections as any[],
        postType: data.postType as string,

        // Resource-specific fields
        resourceType: data.resourceType as string,

        // Solution-specific fields
        primaryIndustry: data.primaryIndustry as string,
        solutionIndustry: data.solutionIndustry as string, // Transformed solution industry
        contentSections: data.contentSections as any[],
        solutionSections: data.solutionSections as any[], // Transformed solution sections

        // Product-specific fields
        portfolioCategory: data.portfolioCategory as string,
        targetIndustries: data.targetIndustries as string[],
        brandName: data.brandName as string,
        keyFeatures: data.keyFeatures as any[],
        technicalSpecifications: data.technicalSpecifications as any[],
        marketingHighlights: data.marketingHighlights as any[],
        productGalleryUrls: data.productGalleryUrls as string[],
        datasheetUrl: data.datasheetUrl as string,
        caseStudyUrl: data.caseStudyUrl as string,

        // Industry-specific fields
        industryDescription: data.industryDescription as string,
        industryBriefDescription: data.industryBriefDescription as string,
        industryStatistics: data.industryStatistics as any[],
        industryFeatures: data.industryFeatures as any[],
        industryLeaders: data.industryLeaders as string[],
        industryIconUrl: data.industryIconUrl as string,
        industryImageUrl: data.industryImageUrl as string,
        industryBrochureUrl: data.industryBrochureUrl as string,
        industryCaseStudyUrl: data.industryCaseStudyUrl as string,

        // Status mapping
        isDraft: typeof data.isDraft === 'boolean' ? data.isDraft : false,
        // Date mapping with safe conversion and fallback
        createdAt: toDate(data.createdAt) || new Date(),
        updatedAt: toDate(data.updatedAt) || new Date(),
        // Author mapping
        createdBy: (data.createdBy as string) || 'N/A',
        updatedBy: (data.updatedBy as string) || 'N/A',
        // Attachment mapping - using standardized image field detection
        productPhotos: (data.productPhotos as string[]) || (data.productGallery as string[]) || (data.productGalleryUrls as string[]) || [],
        productGallery: (data.productGallery as string[]) || (data.productPhotos as string[]) || (data.productGalleryUrls as string[]) || [],
        visuals: (data.visuals as string[]) || (data.visualUrls as string[]) || [],
        galleryCount: (data.galleryCount as number) || 0,
        imageUrl: data.imageUrl as string,
        heroImage: (data.heroImage as string) || (data.heroImageUrl as string) || '',
        heroImageUrl: (data.heroImageUrl as string) || (data.heroImage as string) || '', // Map both heroImage and heroImageUrl
        brochureUrl: (data.brochureUrl as string) || (data.brochure as string) || '',
        datasheets: (data.datasheets as string) || (data.datasheetUrl as string) || '',
        brochures: (data.brochures as string) || (data.brochureUrl as string) || '',
        caseStudies: (data.caseStudies as string) || (data.caseStudyUrl as string) || '',
    };
};

function ListDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const { user: authUser } = useAuthContext(); // Get auth user for display name
    const { refreshData: refreshTagData } = useTags();

    const listType = (searchParams.get("type") as string) || "posts";
    const tabParam = searchParams.get("tab");

    const [items, setItems] = useState<AdminContentItem[]>([]);
    const [allItems, setAllItems] = useState<AdminContentItem[]>([]); // Store all items for sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
    const [sortBy, setSortBy] = useState<"name" | "updated" | "created">("updated");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form dialog state - same structure as admin page
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedTagType, setSelectedTagType] = useState<keyof typeof TAG_CONFIG | "">("");
    const [label, setLabel] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit dialog state
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingItem, setEditingItem] = useState<AdminContentItem | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [editFile, setEditFile] = useState<File | null>(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);

    // Status change modal state
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusChangeItem, setStatusChangeItem] = useState<AdminContentItem | null>(null);
    const [statusChangeAction, setStatusChangeAction] = useState<'publish' | 'draft'>('publish');

    const currentConfig = listConfigurations[listType] || listConfigurations["posts"];
    const [selectedTabIndex, setSelectedTabIndex] = useState(currentConfig.defaultSelectedTabIndex);

    const currentTab = currentConfig.tabs[selectedTabIndex];
    const isTagView = currentTab && (currentTab.collection === 'global-tags' || currentTab.collection === 'product-brands' || currentTab.collection === 'clients');

    // Data fetching function - extracted for reuse
    const fetchData = async () => {
        const tab = currentConfig.tabs[selectedTabIndex];
        let q;

        // CORRECTED QUERY LOGIC
        if (tab.filterField && tab.filterValue) {
            q = query(collection(db, tab.collection), where(tab.filterField, "==", tab.filterValue));
        } else {
            q = query(collection(db, tab.collection));
        }

        try {
            console.log(`[LIST-DEBUG] Fetching data from collection: ${tab.collection}`);
            const snapshot = await getDocs(q);
            console.log(`[LIST-DEBUG] Found ${snapshot.docs.length} documents in ${tab.collection}`);

            // Log first document structure for debugging
            if (snapshot.docs.length > 0) {
                console.log(`[LIST-DEBUG] Sample document structure:`, snapshot.docs[0].data());
            }

            // Use the mapper function here, passing the collection name as the docType
            let data = snapshot.docs.map((doc) => mapToAdminContentItem(doc, tab.collection));
            console.log(`[LIST-DEBUG] Mapped data:`, data);
            setAllItems(data); // Store all items for filtering and sorting
        } catch (error) {
            console.error("Error fetching data:", error);
            setAllItems([]); // Clear items on error
        }
    };

    useEffect(() => {
        if (tabParam) {
            const tabIndex = currentConfig.tabs.findIndex(
                (t) => t.label.toLowerCase() === tabParam.toLowerCase()
            );
            if (tabIndex !== -1) setSelectedTabIndex(tabIndex);
        } else {
            setSelectedTabIndex(currentConfig.defaultSelectedTabIndex);
        }
    }, [tabParam, listType, currentConfig.tabs, currentConfig.defaultSelectedTabIndex]);

    useEffect(() => {
        fetchData();
    }, [listType, selectedTabIndex, currentConfig.tabs]);

    // Store filtered data for pagination calculation
    const [filteredItems, setFilteredItems] = useState<AdminContentItem[]>([]);

    // New effect to handle filtering, searching, and sorting
    useEffect(() => {
        let filteredData = [...allItems];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter((item) =>
                (item.postTitle || "").toLowerCase().includes(term) ||
                (item.resourceTitle || "").toLowerCase().includes(term) ||
                (item.productName || "").toLowerCase().includes(term) ||
                (item.solutionName || "").toLowerCase().includes(term) ||
                (item.industryName || "").toLowerCase().includes(term) ||
                (item.label || "").toLowerCase().includes(term) ||
                (item.headline || "").toLowerCase().includes(term) ||
                (item.slug || "").toLowerCase().includes(term) ||
                (item.id || "").toLowerCase().includes(term)
            );
        }

        // Apply status filter
        if (filterStatus === "published") {
            filteredData = filteredData.filter((item) => item.isDraft === false);
        } else if (filterStatus === "draft") {
            filteredData = filteredData.filter((item) => item.isDraft === true);
        }

        // Apply sorting
        filteredData.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    const aName = a.postTitle || a.resourceTitle || a.productName || a.solutionName || a.industryName || a.label || "";
                    const bName = b.postTitle || b.resourceTitle || b.productName || b.solutionName || b.industryName || b.label || "";
                    return aName.localeCompare(bName);
                case "created":
                    return b.createdAt.getTime() - a.createdAt.getTime();
                case "updated":
                default:
                    return b.updatedAt.getTime() - a.updatedAt.getTime();
            }
        });

        // Store filtered data for pagination calculation
        setFilteredItems(filteredData);

        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        setItems(filteredData.slice(startIndex, startIndex + itemsPerPage));
    }, [allItems, searchTerm, filterStatus, sortBy, currentPage]);

    const handleTabClick = (label: string, index: number) => {
        setSelectedTabIndex(index);
        setCurrentPage(1);
        const params = new URLSearchParams(searchParams);
        params.set("type", listType);
        params.set("tab", label);
        router.push(`?${params.toString()}`);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

    const getFilterCounts = () => {
        const published = allItems.filter((item) => item.isDraft === false).length;
        const draft = allItems.filter((item) => item.isDraft === true).length;
        return { published, draft, total: allItems.length };
    };

    const counts = getFilterCounts();

    // Form handlers - same as admin page
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

        // 🔍 DEBUG: Log user object structure
        console.log('🔍 DEBUG: User object structure:', {
            user: user,
            userName: user?.name,
            userEmail: user?.email,
            userRole: user?.role,
            userKeys: user ? Object.keys(user) : 'no user'
        });

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
                                // Timeline fields for list UI consistency
                                isDraft: false,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                                createdBy: getDatabaseIdentity(authUser),
                                updatedBy: getDatabaseIdentity(authUser),
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
                        // Timeline fields for list UI consistency
                        isDraft: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        createdBy: getDatabaseIdentity(authUser),
                        updatedBy: getDatabaseIdentity(authUser),
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
            resetForm();
            // Refresh data to show new items
            await fetchData();
            // Refresh TagContext so forms get latest data
            await refreshTagData();
        } catch (error) {
            const formError = FormErrorHandler.handleError(error);
            FormErrorHandler.logError(error, context);
            UserNotification.showError(formError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTags([]);
        setLabel('');
        setFile(null);
        setSelectedTagType('');
        setShowAddForm(false);
    };

    const openFormDialog = () => {
        // Auto-select the current tab's collection type
        if (currentTab.collection === 'global-tags') {
            setSelectedTagType('global-tags');
        } else if (currentTab.collection === 'product-brands') {
            setSelectedTagType('product-brands');
        } else if (currentTab.collection === 'clients') {
            setSelectedTagType('clients');
        }
        setShowAddForm(true);
    };

    // Edit functionality
    const handleEdit = (item: AdminContentItem) => {
        setEditingItem(item);
        setEditLabel(item.label || '');
        setEditFile(null);
        setShowEditForm(true);
    };

    const handleEditSubmit = async () => {
        if (!editingItem || !editLabel.trim()) {
            UserNotification.showError("Please enter a valid label.");
            return;
        }

        setIsEditSubmitting(true);
        const context = 'EditTag';
        const clientId = RateLimiter.getClientIdentifier();

        try {
            await withRateLimit(clientId, 'tagSubmission' as RateLimitType, async () => {
                console.log(`[SECURITY] Admin action: ${user?.email} editing ${editingItem.docType} - ${editingItem.id}`);

                const config = TAG_CONFIG[editingItem.docType as keyof typeof TAG_CONFIG];
                if (!config) {
                    throw new Error("Invalid content type for editing.");
                }

                const sanitizedLabel = InputSanitizer.sanitizeString(editLabel);
                if (!sanitizedLabel) {
                    throw new Error("Label cannot be empty after sanitization.");
                }

                let imageUrl = editingItem.imageUrl || "";

                // Handle image upload if new file is provided
                if (config.hasImage && editFile) {
                    const validation = await FileUploadSecurity.validateFile(editFile, {
                        allowedTypes: [...ALLOWED_FILE_TYPES.images],
                        maxSize: FILE_SIZE_LIMITS.image,
                        requireSignatureValidation: true,
                    });

                    if (!validation.isValid) {
                        throw new Error(`File validation failed for "${editFile.name}": ${validation.errors.join(', ')}`);
                    }

                    // Use the existing slug for file path
                    imageUrl = await uploadDoc(`${config.storagePath}/${editingItem.slug}`, editFile);
                }

                const docData = {
                    label: sanitizedLabel,
                    slug: editingItem.slug, // Keep the same slug
                    // Timeline fields for list UI consistency
                    isDraft: editingItem.isDraft || false,
                    updatedAt: new Date(),
                    updatedBy: getDatabaseIdentity(authUser),
                    ...(imageUrl && { imageUrl }),
                    // Preserve original creation fields
                    createdAt: editingItem.createdAt,
                    createdBy: editingItem.createdBy,
                };

                await setDoc(doc(db, config.collectionName, editingItem.id), docData, { merge: true });
            });

            UserNotification.showSuccess(`"${editLabel}" updated successfully!`);

            // Reset edit form and refresh data
            setShowEditForm(false);
            setEditingItem(null);
            setEditLabel('');
            setEditFile(null);
            await fetchData(); // Refresh the list
            // Refresh TagContext so forms get latest data
            await refreshTagData();

        } catch (error) {
            const formError = FormErrorHandler.handleError(error);
            FormErrorHandler.logError(error, context);
            UserNotification.showError(formError);
        } finally {
            setIsEditSubmitting(false);
        }
    };

    // Convert to Draft functionality
    // Handle status toggle with modal confirmation
    const handleStatusToggle = (item: AdminContentItem, action: 'publish' | 'draft') => {
        setStatusChangeItem(item);
        setStatusChangeAction(action);
        setShowStatusModal(true);
    };

    const confirmStatusChange = async () => {
        if (!statusChangeItem) return;

        const context = 'StatusToggle';
        const clientId = RateLimiter.getClientIdentifier();

        // 🔍 DEBUG: Log user object structure in status change
        console.log('🔍 DEBUG: User object in status change:', {
            user: user,
            userName: user?.name,
            userEmail: user?.email,
            userRole: user?.role,
            userKeys: user ? Object.keys(user) : 'no user'
        });

        try {
            await withRateLimit(clientId, 'dataUpdate' as RateLimitType, async () => {
                console.log(`[SECURITY] Admin action: ${user?.email} changing status of ${statusChangeItem.id} to ${statusChangeAction}`);

                const itemCollection = currentConfig.tabs[selectedTabIndex].collection;
                const docRef = doc(db, itemCollection, statusChangeItem.id);

                await updateDoc(docRef, {
                    isDraft: statusChangeAction === 'draft',
                    updatedAt: new Date(),
                    updatedBy: getDatabaseIdentity(authUser)
                });

                UserNotification.showSuccess(
                    `Successfully ${statusChangeAction === 'draft' ? 'converted to draft' : 'published'}: ${statusChangeItem.postTitle ||
                    statusChangeItem.resourceTitle ||
                    statusChangeItem.productName ||
                    statusChangeItem.solutionName ||
                    statusChangeItem.industryName ||
                    statusChangeItem.label ||
                    'Item'
                    }`
                );

                // Refresh data
                await fetchData();
            });
        } catch (error) {
            console.error('Error updating status:', error);
            UserNotification.showError('Failed to update status. Please try again.');
        } finally {
            setShowStatusModal(false);
            setStatusChangeItem(null);
        }
    };

    const handleConvertToDraft = async (item: AdminContentItem) => {
        const itemName = item.label || item.postTitle || item.productName || item.solutionName || 'this item';

        if (!confirm(`Are you sure you want to convert "${itemName}" to draft? This will hide it from public view.`)) {
            return;
        }

        const context = 'ConvertToDraft';
        const clientId = RateLimiter.getClientIdentifier();

        try {
            await withRateLimit(clientId, 'tagSubmission' as RateLimitType, async () => {
                console.log(`[SECURITY] Admin action: ${user?.email} converting to draft ${item.docType} - ${item.id}`);

                // For tag collections, use the TAG_CONFIG
                if (isTagView) {
                    const config = TAG_CONFIG[item.docType as keyof typeof TAG_CONFIG];
                    if (config) {
                        await setDoc(doc(db, config.collectionName, item.id), {
                            isDraft: true,
                            updatedAt: new Date(),
                            updatedBy: getDatabaseIdentity(authUser),
                        }, { merge: true });
                    } else {
                        throw new Error("Invalid content type for draft conversion.");
                    }
                } else {
                    // For other collections, use the docType directly
                    await setDoc(doc(db, item.docType, item.id), {
                        isDraft: true,
                        updatedAt: new Date(),
                        updatedBy: getDatabaseIdentity(authUser),
                    }, { merge: true });
                }
            });

            UserNotification.showSuccess(`"${itemName}" converted to draft successfully!`);
            await fetchData(); // Refresh the list
            // Refresh TagContext so forms get latest data
            await refreshTagData();

        } catch (error) {
            const formError = FormErrorHandler.handleError(error);
            FormErrorHandler.logError(error, context);
            UserNotification.showError(formError);
        }
    };

    // Delete functionality
    const handleDelete = async (item: AdminContentItem) => {
        const itemName = item.label || item.postTitle || item.productName || item.solutionName || 'this item';

        if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
            return;
        }

        const context = 'DeleteTag';
        const clientId = RateLimiter.getClientIdentifier();

        try {
            await withRateLimit(clientId, 'tagSubmission' as RateLimitType, async () => {
                console.log(`[SECURITY] Admin action: ${user?.email} deleting ${item.docType} - ${item.id}`);

                // For tag collections, use the TAG_CONFIG
                if (isTagView) {
                    const config = TAG_CONFIG[item.docType as keyof typeof TAG_CONFIG];
                    if (config) {
                        await deleteDoc(doc(db, config.collectionName, item.id));
                    } else {
                        throw new Error("Invalid content type for deletion.");
                    }
                } else {
                    // For other collections, use the docType directly
                    await deleteDoc(doc(db, item.docType, item.id));
                }
            });

            UserNotification.showSuccess(`"${itemName}" deleted successfully!`);
            await fetchData(); // Refresh the list
            // Refresh TagContext so forms get latest data
            await refreshTagData();

        } catch (error) {
            const formError = FormErrorHandler.handleError(error);
            FormErrorHandler.logError(error, context);
            UserNotification.showError(formError);
        }
    };

    return (
        <DefaultPageLayout>
            <div className="max-w-none flex h-full w-full flex-col items-center gap-12 bg-neutral-50 py-6">
                <div className="flex w-full max-w-[1280px] flex-col items-start justify-center gap-6">
                    <div className="flex w-full items-center gap-4 px-4">
                        <Link href="/admin">
                            <Button3
                                variant="neutral-tertiary"
                                size="large"
                                icon={<FeatherArrowLeft />} />
                        </Link>
                        <div className="flex w-0.5 mr-2 flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />
                        <div className="flex grow items-center justify-between pl-2">
                            <span className="text-body-xl text-default-font">
                                {currentConfig.heading}
                            </span>
                        </div>
                        <Image className="max-w-[140px] flex-none" src="/Consort-Blue.svg" alt="Topbar image" width={160} height={160} />
                    </div>

                    <div className="w-full">
                        {/* Top Row - Just Tabs */}
                        <div className="px-3 mb-4">
                            <Tabs>
                                {currentConfig.tabs.map((tab, index) => (
                                    <Tabs.Item
                                        key={tab.label}
                                        active={index === selectedTabIndex}
                                        onClick={() => handleTabClick(tab.label, index)}
                                    >
                                        {tab.label}
                                    </Tabs.Item>
                                ))}
                            </Tabs>
                        </div>

                        <div className="w-full bg-default-background px-6 py-6 shadow-md rounded-md">
                            {/* Enhanced Toolbar */}
                            <div className="bg-neutral-50 rounded-sm border border-neutral-border p-4 mb-4">
                                <div className="flex justify-between items-center gap-6">
                                    {/* Search Bar - Left Side */}
                                    <div className="relative flex items-center">
                                        <FeatherSearch className="absolute left-3 text-neutral-500 z-10 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder={`Search ${currentConfig.tabs[selectedTabIndex]?.label.toLowerCase()}...`}
                                            className="w-[320px] h-8 pl-10 pr-10 bg-white border border-neutral-300 rounded-sm text-caption font-caption text-default-font placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={clearSearch}
                                                className="absolute right-3 text-neutral-400 hover:text-neutral-600 z-10 transition-colors"
                                            >
                                                <FeatherX className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Actions - Right Side */}
                                    <div className="flex items-center gap-3">
                                        {/* Add Button - Shows for tag views */}
                                        {isTagView && (
                                            <Button3
                                                onClick={openFormDialog}
                                                className="h-8 !rounded-[6px"
                                                variant="brand-primary"
                                                size="medium"
                                                icon={<FeatherPlus />}
                                            >
                                                Add {currentTab.collection === 'clients' ? 'Client' :
                                                    currentTab.collection === 'global-tags' ? 'Tag' : 'Brand'}
                                            </Button3>
                                        )}

                                        {/* Add New Button - Shows for main content types */}
                                        {!isTagView && (
                                            <Button3
                                                onClick={() => {
                                                                                        const addNewRoutes: Record<string, string> = {
                                        'posts': '/admin/posts',
                                        'resources': '/admin/resources',
                                        'products': '/admin/products',
                                        'solutions': '/admin/solutions',
                                        'industries': '/admin/industries'
                                    };
                                                    const route = addNewRoutes[listType];
                                                    if (route) router.push(route);
                                                }}
                                                className="h-8 !rounded-[6px]"
                                                variant="brand-primary"
                                                size="medium"
                                                icon={<FeatherPlus />}
                                            >
                                                Add New {listType === 'solutions' ? 'Solution' :
                                                    listType.charAt(0).toUpperCase() + listType.slice(1, -1)}
                                            </Button3>
                                        )}

                                        {/* Filter Pills Container */}
                                        <div className="flex items-center bg-white border border-neutral-200 rounded-sm p-1 gap-1">
                                            <button
                                                onClick={() => { setFilterStatus("all"); setCurrentPage(1); }}
                                                className={`h-7 px-3 text-sm font-caption rounded-[4px] transition-colors ${filterStatus === "all"
                                                    ? "bg-neutral-200 text-neutral-700"
                                                    : "text-neutral-700 hover:bg-neutral-100"
                                                    }`}
                                            >
                                                All ({counts.total})
                                            </button>
                                            <button
                                                onClick={() => { setFilterStatus("published"); setCurrentPage(1); }}
                                                className={`h-7 px-3 text-sm font-caption rounded-[4px] transition-colors ${filterStatus === "published"
                                                    ? "bg-neutral-200 text-neutral-700"
                                                    : "text-neutral-700 hover:bg-neutral-100"
                                                    }`}
                                            >
                                                Published ({counts.published})
                                            </button>
                                            <button
                                                onClick={() => { setFilterStatus("draft"); setCurrentPage(1); }}
                                                className={`h-7 px-3 text-sm font-caption rounded-[4px] transition-colors ${filterStatus === "draft"
                                                    ? "bg-neutral-200 text-neutral-700"
                                                    : "text-neutral-700 hover:bg-neutral-100"
                                                    }`}
                                            >
                                                Drafts ({counts.draft})
                                            </button>
                                        </div>

                                        {/* Sort Select */}
                                        <Select value={sortBy} onValueChange={(value: "name" | "updated" | "created") => setSortBy(value)}>
                                            <SelectTrigger className="w-[160px] h-8">
                                                <SelectValue placeholder="Sort by..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="updated">
                                                    Recently Updated
                                                </SelectItem>
                                                <SelectItem value="created">
                                                    Recently Created
                                                </SelectItem>
                                                <SelectItem value="name">
                                                    Name (A-Z)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Consistent Form Dialog */}
                            {showAddForm && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-sm shadow-md w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                                        {/* Simple Header */}
                                        <div className="px-6 py-4 border-b border-neutral-border">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-body font-body text-brand-600">
                                                    Add Content
                                                </h3>
                                                <button
                                                    onClick={resetForm}
                                                    className="text-neutral-400 hover:text-neutral-600"
                                                >
                                                    <FeatherX className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="px-6 py-6 space-y-6">
                                            {/* Content Type Selection */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[12px] font-medium font-inter pl-2 text-default-font">
                                                        Content Type <span className="text-red-500">*</span>
                                                    </label>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    {Object.entries(TAG_CONFIG).map(([key, config]) => (
                                                        <button
                                                            key={key}
                                                            onClick={() => setSelectedTagType(key as keyof typeof TAG_CONFIG)}
                                                            className={`p-3 rounded-sm border transition-colors text-center ${selectedTagType === key
                                                                ? 'border-brand-500 bg-brand-50'
                                                                : 'border-neutral-200 hover:border-neutral-300 bg-background'
                                                                }`}
                                                        >
                                                            <span className="text-sm font-medium text-default-font">
                                                                {config.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Global Tags Form */}
                                            {selectedTagType === 'global-tags' && (
                                                <div className="space-y-4">

                                                    <div>
                                                        <label className="text-[12px] font-medium font-inter pl-2 text-default-font mb-2 block">
                                                            Tag Names (up to 10)
                                                        </label>
                                                        {/* Tags Display */}
                                                        {tags.length > 0 && (
                                                            <div>
                                                                {/* <label className="text-[12px] font-medium font-inter pl-2 text-default-font mb-2 block">
                                                                Added Tags ({tags.length}/10)
                                                            </label> */}
                                                                <div className="flex flex-wrap gap-1.5 my-2">
                                                                    {tags.map((tag, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="px-2.5 py-0.5 bg-brand-100 rounded-sm hover:bg-brand-200 flex items-center gap-1"
                                                                        >
                                                                            <span className="text-xs font-medium font-caption text-consort-blue">{tag}</span>
                                                                            <button
                                                                                onClick={() => removeTag(index)}
                                                                                className="text-consort-blue hover:text-red-500"
                                                                            >
                                                                                <FeatherX className="text-sm text-consort-red" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <Input
                                                            value={label}
                                                            onChange={(e) => setLabel(e.target.value)}
                                                            onKeyDown={handleTagInputKeyDown}
                                                            placeholder="Type tag name and press Enter"
                                                            disabled={isSubmitting || tags.length >= 10}
                                                            maxLength={50}
                                                            className="w-full"
                                                        />
                                                        <p className="text-xs text-subtext-color mt-1 pl-2">
                                                            Press Enter to add each tag
                                                        </p>
                                                    </div>


                                                </div>
                                            )}

                                            {/* Clients/Brands Form */}
                                            {selectedTagType && selectedTagType !== 'global-tags' && (
                                                <div className="space-y-4">
                                                    {/* Name Input using FormInput pattern */}
                                                    <div className="flex flex-row items-center gap-2 w-full">
                                                        <label className="text-[12px] w-[170px] font-medium font-inter pl-2 text-default-font">
                                                            {selectedTagType === 'clients' ? 'Client Name' : 'Brand Name'} <span className="text-red-500">*</span>
                                                        </label>
                                                        <Input
                                                            value={label}
                                                            onChange={(e) => setLabel(e.target.value)}
                                                            placeholder={selectedTagType === 'clients' ? 'e.g., Acme Corporation' : 'e.g., ProMax Series'}
                                                            disabled={isSubmitting}
                                                            maxLength={50}
                                                            className="w-full"
                                                        />
                                                        <div className="flex justify-between items-center px-2">
                                                            <span className="text-xs text-subtext-color">
                                                                {50 - label.length} characters remaining
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Simple File Upload */}
                                                    <div className="flex flex-row gap-2 w-full items-center">
                                                        <label className="text-[12px] w-[110px] font-medium font-inter pl-2 text-default-font">
                                                            {selectedTagType === 'clients' ? 'Client Logo' : 'Brand Logo'} <span className="text-red-500">*</span>
                                                        </label>

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

                                                        <div className="flex items-center gap-3">
                                                            <Button3
                                                                variant="brand-secondary"
                                                                size="medium"
                                                                icon={<FeatherUpload />}
                                                                onClick={() => document.getElementById('tag-file-upload')?.click()}
                                                                disabled={isSubmitting}
                                                            >
                                                                Choose File
                                                            </Button3>

                                                            {file ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-default-font truncate max-w-[200px]">
                                                                        {file.name}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setFile(null)}
                                                                        className="text-neutral-400 hover:text-neutral-600"
                                                                    >
                                                                        <FeatherX className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-subtext-color">
                                                                    PNG, JPG, WebP up to 10MB
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Form Actions */}
                                            {selectedTagType && (
                                                <div className="pt-4 border-t border-neutral-border">
                                                    <div className="flex justify-between items-center">
                                                        <Button3
                                                            onClick={handlePublish}
                                                            disabled={isSubmitting || (selectedTagType === 'global-tags' ? tags.length === 0 : !label || (TAG_CONFIG[selectedTagType as keyof typeof TAG_CONFIG].hasImage && !file))}
                                                        >
                                                            {isSubmitting ? 'Publishing...' :
                                                                selectedTagType === 'global-tags' ? `Publish ${tags.length} Tags` : 'Publish'}
                                                        </Button3>

                                                        <Button3
                                                            variant="neutral-tertiary"
                                                            onClick={resetForm}
                                                            disabled={isSubmitting}
                                                        >
                                                            Cancel
                                                        </Button3>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Consistent Edit Form Dialog */}
                            {showEditForm && editingItem && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-sm shadow-md w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                                        {/* Simple Header */}
                                        <div className="px-6 py-4 border-b border-neutral-border">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-body font-body text-brand-600">
                                                    Edit {TAG_CONFIG[editingItem.docType as keyof typeof TAG_CONFIG]?.label || 'Item'}
                                                </h3>
                                                <button
                                                    onClick={() => {
                                                        setShowEditForm(false);
                                                        setEditingItem(null);
                                                        setEditLabel('');
                                                        setEditFile(null);
                                                    }}
                                                    className="text-neutral-400 hover:text-neutral-600"
                                                >
                                                    <FeatherX className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="px-6 py-6 space-y-6">
                                            {/* Current Item Preview */}
                                            <div className="">
                                                <div className="mb-2">
                                                    <label className="text-sm font-medium font-inter pl-2 text-neutral-600 text-default-font">
                                                        Current Item
                                                    </label>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white rounded-sm p-3 border border-neutral-200">
                                                    {editingItem.imageUrl && (
                                                        <div className="w-24 h-24 relative rounded bg-white flex-shrink-0">
                                                            <Image
                                                                src={editingItem.imageUrl}
                                                                alt={editingItem.label || ''}
                                                                fill
                                                                sizes="48px"
                                                                style={{ objectFit: 'contain' }}
                                                                className="p-1"
                                                                unoptimized
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-body !font-bold font-body text-default-font font-medium">
                                                            {editingItem.label}
                                                        </p>
                                                        <p className="text-sm text-subtext-color">
                                                            ID: {editingItem.id} • Created: {editingItem.createdAt.toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit Form - Updated to match Add Form layout */}
                                            <div className="space-y-4">
                                                {/* Name Input using consistent horizontal layout */}
                                                <div className="flex flex-row items-center gap-2 w-full">
                                                    <label className="text-sm w-[200px] font-medium font-inter pl-2 text-neutral-600 text-default-font">
                                                        {editingItem.docType === 'clients' ? 'Client Name' :
                                                            editingItem.docType === 'product-brands' ? 'Brand Name' : 'Label'} <span className="text-red-500">*</span>
                                                    </label>
                                                    <Input
                                                        value={editLabel}
                                                        onChange={(e) => setEditLabel(e.target.value)}
                                                        placeholder="Enter new name"
                                                        disabled={isEditSubmitting}
                                                        maxLength={50}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between items-center px-2">
                                                        <span className="text-xs text-subtext-color">
                                                            {50 - editLabel.length} characters remaining
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Image Upload - Consistent horizontal layout */}
                                                {TAG_CONFIG[editingItem.docType as keyof typeof TAG_CONFIG]?.hasImage && (
                                                    <div className="flex flex-row gap-2 w-full items-center">
                                                        <label className="text-sm w-[120px] font-medium font-inter pl-2 text-neutral-600">
                                                            {editingItem.docType === 'clients' ? 'Client Logo' : 'Brand Logo'}
                                                        </label>

                                                        <input
                                                            type="file"
                                                            id="edit-file-upload"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const selectedFile = e.target.files?.[0];
                                                                if (selectedFile) setEditFile(selectedFile);
                                                            }}
                                                        />

                                                        <div className="flex items-center gap-3">
                                                            <Button3
                                                                variant="brand-secondary"
                                                                size="medium"
                                                                icon={<FeatherUpload />}
                                                                onClick={() => document.getElementById('edit-file-upload')?.click()}
                                                                disabled={isEditSubmitting}
                                                            >
                                                                {editFile ? 'Replace File' : 'Choose File'}
                                                            </Button3>

                                                            {editFile ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-default-font truncate max-w-[200px]">
                                                                        {editFile.name}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setEditFile(null)}
                                                                        className="text-neutral-400 hover:text-neutral-600"
                                                                    >
                                                                        <FeatherX className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-subtext-color">
                                                                    PNG, JPG, WebP up to 10MB
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Form Actions */}
                                            <div className="pt-4 border-t border-neutral-border">
                                                <div className="flex justify-between items-center">
                                                    <Button3
                                                        onClick={handleEditSubmit}
                                                        disabled={isEditSubmitting || !editLabel.trim()}
                                                    >
                                                        {isEditSubmitting ? 'Updating...' : 'Update'}
                                                    </Button3>

                                                    <Button3
                                                        variant="neutral-tertiary"
                                                        onClick={() => {
                                                            setShowEditForm(false);
                                                            setEditingItem(null);
                                                            setEditLabel('');
                                                            setEditFile(null);
                                                        }}
                                                        disabled={isEditSubmitting}
                                                    >
                                                        Cancel
                                                    </Button3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 ">
                                {items.length === 0 ? (
                                    <p className="text-sm text-neutral-500">No data found.</p>
                                ) : isTagView ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                        {items.map((item) => (
                                            <TagCard
                                                key={item.id}
                                                item={{
                                                    id: item.id,
                                                    label: item.label || 'Untitled',
                                                    imageUrl: item.imageUrl,
                                                    createdAt: item.createdAt,
                                                }}
                                                onEdit={() => {
                                                    handleEdit(item);
                                                }}
                                                onDelete={() => {
                                                    handleDelete(item);
                                                }}
                                                onConvertToDraft={!item.isDraft ? () => {
                                                    handleConvertToDraft(item);
                                                } : undefined}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <ContentCard
                                            key={item.id}
                                            item={item}
                                            listType={listType}
                                            handleStatusToggle={handleStatusToggle}
                                        />
                                    ))
                                )}
                            </div>

                            <div className="flex justify-center align-items-center items-center px-6 mt-4">

                                <div className="flex items-center gap-6">
                                    <Button3
                                        variant="brand-secondary"
                                        size="medium"
                                        icon={<FeatherChevronLeft />}
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Prev
                                    </Button3>
                                    <span className="text-caption text-subtext-color">
                                        {(() => {
                                            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
                                            return totalPages > 0 ? `Showing Page ${currentPage} of ${totalPages}` : 'No Data found';
                                        })()}
                                    </span>
                                    <Button3
                                        variant="brand-secondary"
                                        size="medium"
                                        icon={<FeatherChevronRight />}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        disabled={currentPage >= Math.ceil(filteredItems.length / itemsPerPage)}
                                    >
                                        Next
                                    </Button3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Change Confirmation Modal */}
            {showStatusModal && statusChangeItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            Confirm Status Change
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to {statusChangeAction === 'draft' ? 'convert to draft' : 'publish'} "{
                                statusChangeItem.postTitle ||
                                statusChangeItem.resourceTitle ||
                                statusChangeItem.productName ||
                                statusChangeItem.solutionName ||
                                statusChangeItem.industryName ||
                                statusChangeItem.label ||
                                'this item'
                            }"?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button3
                                variant="neutral-secondary"
                                onClick={() => setShowStatusModal(false)}
                            >
                                Cancel
                            </Button3>
                            <Button3
                                variant={statusChangeAction === 'draft' ? 'warning-primary' : 'success-primary'}
                                onClick={confirmStatusChange}
                            >
                                {statusChangeAction === 'draft' ? 'Convert to Draft' : 'Publish'}
                            </Button3>
                        </div>
                    </div>
                </div>
            )}
        </DefaultPageLayout>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ListDetailsContent />
        </Suspense>
    );
}

const DropdownMenuButton = ({ icon, label, options = ["Add filter"], onSelect }: {
    icon: React.ReactNode;
    label: string;
    options?: string[];
    onSelect?: (value: string) => void;
}) => (
    <SubframeCore.DropdownMenu.Root>
        <SubframeCore.DropdownMenu.Trigger asChild>
            <Button variant="neutral-secondary" icon={icon} iconRight={<FeatherChevronDown />}>
                {label}
            </Button>
        </SubframeCore.DropdownMenu.Trigger>
        <SubframeCore.DropdownMenu.Portal>
            <SubframeCore.DropdownMenu.Content side="bottom" align="start" sideOffset={4} asChild>
                <DropdownMenu>
                    {options.map((opt) => (
                        <DropdownMenu.DropdownItem key={opt} onSelect={() => onSelect?.(opt)}>
                            {opt}
                        </DropdownMenu.DropdownItem>
                    ))}
                </DropdownMenu>
            </SubframeCore.DropdownMenu.Content>
        </SubframeCore.DropdownMenu.Portal>
    </SubframeCore.DropdownMenu.Root>
);

function ContentCard({ item, listType, handleStatusToggle }: {
    item: AdminContentItem;
    listType: string;
    handleStatusToggle: (item: AdminContentItem, action: 'publish' | 'draft') => void;
}) {
    const lastUpdated = item.updatedAt ? item.updatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
    const dateAdded = item.createdAt ? item.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    // Expanded image detection logic using standardized fields + productGalleryUrls
    const hasPhotos =
        // Gallery count for products (indicates multiple images)
        (item.galleryCount && item.galleryCount > 0) ||
        // Hero image for posts/resources/solutions
        (item.heroImage && item.heroImage.trim() !== '') ||
        // Industry image for industries
        (item.industryImageUrl && item.industryImageUrl.trim() !== '') ||
        // Product gallery URLs array (backup detection for galleries)
        (item.productGalleryUrls && item.productGalleryUrls.length > 0) ||
        // Fallback to imageUrl for other content types
        (item.imageUrl && item.imageUrl.trim() !== '');

    let heading: string = "Untitled";
    let subheading: string | undefined;

    switch (item.docType) {
        case 'industries':
            heading = item.industryName || 'Untitled Industry';
            subheading = item.industryOverview;
            break;
        case 'posts':
            heading = item.postTitle || 'Untitled Post';
            subheading = item.headline;
            break;
        case 'resources':
            heading = item.resourceTitle || 'Untitled Resource';
            subheading = item.headline;
            break;
        case 'solutions':
            heading = item.solutionName || 'Untitled Solution';
            subheading = item.solutionOverview;
            break;
        case 'products':
        case 'portfolio':
            heading = item.productName || 'Untitled Product';
            subheading = item.marketingTagline;
            break;
        case 'global-tags':
        case 'product-brands':
        case 'client-logos':
        case 'icons':
            heading = item.label || 'Untitled Tag';
            break;
        default:
            // Fallback for any other collection or mis-typed collections
            heading = item.label || item.postTitle || item.productName || 'Untitled';
            break;
    }

    return (
        <div className="group flex w-full items-center gap-3 border-b border-solid border-neutral-border px-3 py-3 hover:bg-neutral-50 transition-colors">
            {/* Compact Status Indicator */}
            <div className="flex-none">
                {item.isDraft ? (
                    <div className="flex items-center justify-center w-2 h-2 rounded-full bg-warning-500" title="Draft" />
                ) : (
                    <div className="flex items-center justify-center w-2 h-2 rounded-full bg-success-500" title="Published" />
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex min-w-0 flex-1 items-center gap-4">
                {/* Title and Description */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-4 mb-1">
                        <span className="line-clamp-1 text-body-bold font-body-bold text-default-font">
                            {heading}
                        </span>
                        {/* Inline Attachment Badges */}
                        <div className="flex items-center gap-1.5">
                            {hasPhotos && (
                                <div className="flex items-center justify-center w-5 h-5 rounded-[4px] hover:bg-teal-50/70 bg-teal-100 text-teal-600" title={
                                    item.galleryCount && item.galleryCount > 0
                                        ? `${item.galleryCount} Images`
                                        : item.productGalleryUrls && item.productGalleryUrls.length > 0
                                            ? `${item.productGalleryUrls.length} Images`
                                            : "Has Images"
                                }>
                                    <FeatherImage className="h-3 w-3" />
                                </div>
                            )}
                            {item.datasheets && (
                                <div className="flex items-center justify-center w-5 h-5 rounded-[4px] hover:bg-blue-200/70 bg-blue-100 text-blue-800" title="Has Datasheet">
                                    <FeatherFile className="h-3 w-3" />
                                </div>
                            )}
                            {item.brochures && (
                                <div className="flex items-center justify-center w-5 h-5 rounded-[4px] hover:bg-pink-100/70 bg-pink-100 text-red-600" title="Has Brochure">
                                    <FeatherSidebar className="h-3 w-3" />
                                </div>
                            )}
                            {item.caseStudies && (
                                <div className="flex items-center justify-center w-5 h-5 rounded-[4px] hover:bg-amber-200/70 bg-amber-100 text-amber-800" title="Has Case Study">
                                    <FeatherFileText className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    </div>
                    {subheading && (
                        <span className="line-clamp-1 text-sm font-body text-subtext-color">
                            {subheading}
                        </span>
                    )}
                </div>

                {/* Compact Meta Info */}
                <div className="flex-none text-right">
                    <div className="text-xs font-caption text-subtext-color">
                        Updated {lastUpdated}
                    </div>
                    <div className="text-xs font-bold font-caption text-brand-600">
                        by {item.updatedBy && item.updatedBy.includes('@')
                            ? getDisplayNameFromEmail(item.updatedBy)
                            : (item.updatedBy || "N/A")}
                    </div>
                </div>

                {/* Actions - Show on Hover */}
                <div className="flex-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/${listType}/edit/${item.id}`}>
                            <Button3 variant="destructive-secondary" size="small" icon={<FeatherEdit />} title="Edit" />
                        </Link>
                        <Link href={`/${(item.docType === 'products' || item.docType === 'portfolio') ? 'portfolio' : listType === 'solutions' ? 'solution' : listType}/${item.slug}`} target="_blank">
                            <Button3 variant="neutral-primary" size="small" icon={<FeatherEye />} title="View" />
                        </Link>
                        {/* Simple Status Toggle Logic */}
                        {item.isDraft ? (
                            // Item is DRAFT - show "Convert to Published" button
                            <Button3
                                variant="success-secondary"
                                size="small"
                                icon={<FeatherCheck />}
                                onClick={() => handleStatusToggle(item, 'publish')}
                                title="Convert to Published"
                            />
                        ) : (
                            // Item is PUBLISHED - show "Convert to Draft" button
                            <Button3
                                variant="warning-secondary"
                                size="small"
                                icon={<FeatherDraftingCompass />}
                                onClick={() => handleStatusToggle(item, 'draft')}
                                title="Convert to Draft"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
