'use client';

import React from 'react';
import { PostForm } from './form/components/PostForm';
import { AdminFormPageLayout } from '../forms/layouts/AdminFormPageLayout';

export default function PostFormPage() {
    return (
        <AdminFormPageLayout>
            <PostForm />
        </AdminFormPageLayout>
    );
} 