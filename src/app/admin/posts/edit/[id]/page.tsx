"use client"

import React from "react";
import { PostEditForm } from './components/PostEditForm';
import { AdminFormPageLayout } from '../../../forms/layouts/AdminFormPageLayout';

interface PostEditPageProps {
    params: { id: string };
}

export default function PostEditPage({ params }: PostEditPageProps) {
    return (
        <AdminFormPageLayout>
            <PostEditForm documentId={params.id} />
        </AdminFormPageLayout>
    );
} 