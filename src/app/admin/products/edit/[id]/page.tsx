"use client"

import React from "react";
import { ProductEditForm } from './components/ProductEditForm';
import { AdminFormPageLayout } from '../../../forms/layouts/AdminFormPageLayout';

interface ProductEditPageProps {
    params: { id: string };
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
    return (
        <AdminFormPageLayout>
            <ProductEditForm documentId={params.id} />
        </AdminFormPageLayout>
    );
} 