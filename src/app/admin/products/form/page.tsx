"use client"

import React from "react";
import { ProductForm } from './components/ProductForm';
import { AdminFormPageLayout } from '../../forms/layouts/AdminFormPageLayout';

export default function ProductFormPage() {
    return (
        <AdminFormPageLayout>
            <ProductForm />
        </AdminFormPageLayout>
    );
}
