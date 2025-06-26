"use client"

import React from "react";
import { ResourceEditForm } from './components/ResourceEditForm';
import { AdminFormPageLayout } from '../../../forms/layouts/AdminFormPageLayout';

interface ResourceEditPageProps {
    params: { id: string };
}

export default function ResourceEditPage({ params }: ResourceEditPageProps) {
    return (
        <AdminFormPageLayout>
            <ResourceEditForm documentId={params.id} />
        </AdminFormPageLayout>
    );
} 