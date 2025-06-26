"use client"

import React from "react";
import { SolutionEditForm } from './components/SolutionEditForm';
import { AdminFormPageLayout } from '../../../forms/layouts/AdminFormPageLayout';

interface SolutionEditPageProps {
    params: { id: string };
}

export default function SolutionEditPage({ params }: SolutionEditPageProps) {
    return (
        <AdminFormPageLayout>
            <SolutionEditForm documentId={params.id} />
        </AdminFormPageLayout>
    );
} 