'use client';

import Link from "next/link";
import { db } from "@/firebase/firebaseconfig";
import { Button3 } from "@/ui/components/Button3";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/ui/components/Tabs";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { collection, getDocs, query, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { FeatherArrowLeft } from "@subframe/core";
import { UserNotification } from "@/app/admin/forms/utils/errorHandler";
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TagCard, TagItem } from '@/components/admin/TagCard';

const toDate = (date: unknown): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (date instanceof Timestamp) return date.toDate();
    if (typeof date === 'string') {
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof date === 'number') {
        return new Date(date * 1000);
    }
    return null;
};

const mapToTagItem = (doc: { id: string; data: () => Record<string, unknown> }): TagItem => {
    const data = doc.data();
    return {
        id: doc.id,
        label: data.label as string || 'Untitled',
        imageUrl: data.imageUrl as string,
        createdAt: toDate(data.createdAt) || new Date(),
    };
};

const TAG_TABS = [
    { label: "Global Tags", collection: "global-tags" },
    { label: "Clients", collection: "clients" },
    { label: "Product Brands", collection: "product-brands" },
    { label: "Icons", collection: "icons" },
];

function TagSystemContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get("tab");

    const [items, setItems] = useState<TagItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<TagItem | null>(null);

    const initialTabIndex = Math.max(0, TAG_TABS.findIndex(t => t.label.toLowerCase() === tabParam?.toLowerCase()));
    const [selectedTabIndex, setSelectedTabIndex] = useState(initialTabIndex);

    useEffect(() => {
        const tabIndex = TAG_TABS.findIndex(t => t.label.toLowerCase() === tabParam?.toLowerCase());
        if (tabIndex !== -1) {
            setSelectedTabIndex(tabIndex);
        }
    }, [tabParam]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const tab = TAG_TABS[selectedTabIndex];
            if (!tab) return;

            try {
                const q = query(collection(db, tab.collection));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(mapToTagItem);
                setItems(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())); // Sort by most recent
            } catch (error) {
                console.error("Error fetching tags:", error);
                UserNotification.showError("There was an error fetching the tags.");
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedTabIndex]);

    const handleTabClick = (label: string, index: number) => {
        setSelectedTabIndex(index);
        const params = new URLSearchParams(searchParams);
        params.set("tab", label);
        router.push(`?${params.toString()}`);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            const collectionName = TAG_TABS[selectedTabIndex]?.collection;
            if (!collectionName) {
                throw new Error("Could not determine collection for deletion.");
            }
            await deleteDoc(doc(db, collectionName, itemToDelete.id));
            setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
            UserNotification.showSuccess("Item deleted successfully.");
        } catch (error) {
            console.error("Error deleting item:", error);
            UserNotification.showError("Failed to delete the item.");
        } finally {
            setItemToDelete(null); // Close dialog
        }
    };

    return (
        <DefaultPageLayout>
            <div className="mx-auto max-w-[1920px] py-12 flex h-full w-100vw flex-col gap-8 bg-neutral-50 py-6">
                {/* Header */}
                <div className="flex w-full items-center gap-4">
                    <Link href="/admin">
                        <Button3 variant="brand-tertiary" size="large" icon={<FeatherArrowLeft />} />
                    </Link>
                    <div className="h-full w-px bg-neutral-border" />
                    <span className="text-heading-3 font-heading-3 text-default-font">
                        Tag System
                    </span>
                </div>

                {/* Content */}
                <div className="flex w-full flex-col gap-6">
                    <Tabs>
                        {TAG_TABS.map((tab, index) => (
                            <Tabs.Item
                                key={tab.label}
                                active={index === selectedTabIndex}
                                onClick={() => handleTabClick(tab.label, index)}
                            >
                                {tab.label}
                            </Tabs.Item>
                        ))}
                    </Tabs>

                    <div className="w-full p-0">
                        {isLoading ? (
                            <div className="text-center text-subtext-color">Loading...</div>
                        ) : items.length === 0 ? (
                            <div className="text-center text-subtext-color">No items found in this category.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                {items.map((item) => (
                                    <TagCard
                                        key={item.id}
                                        item={item}
                                        onDelete={() => setItemToDelete(item)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                title="Are you sure?"
                description="This action cannot be undone. This will permanently delete the item."
            />
        </DefaultPageLayout>
    );
}

export default function TagSystemPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TagSystemContent />
        </Suspense>
    );
} 