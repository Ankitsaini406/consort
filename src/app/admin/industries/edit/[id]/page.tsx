"use client"

import React from "react";
import { IndustryEditForm } from './components/IndustryEditForm';
import { AdminFormPageLayout } from '../../../forms/layouts/AdminFormPageLayout';

interface IndustryEditPageProps {
    params: { id: string };
}

export default function IndustryEditPage({ params }: IndustryEditPageProps) {
    return (
        <AdminFormPageLayout>
            <IndustryEditForm documentId={params.id} />
        </AdminFormPageLayout>
    );
} 