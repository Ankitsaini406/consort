'use client';

import React from 'react';
import { ResourceForm } from './form/components/ResourceForm';
import { AdminFormPageLayout } from '../forms/layouts/AdminFormPageLayout';

export default function ResourceFormPage() {
    return (
        <AdminFormPageLayout>
            <ResourceForm />
        </AdminFormPageLayout>
    );
} 