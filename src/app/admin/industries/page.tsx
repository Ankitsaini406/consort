'use client';

import React from 'react';
import { IndustryForm } from './form/IndustryForm';
import { AdminFormPageLayout } from '../forms/layouts/AdminFormPageLayout';

export default function IndustryFormPage() {
    return (
        <AdminFormPageLayout>
            <IndustryForm />
        </AdminFormPageLayout>
    );
} 