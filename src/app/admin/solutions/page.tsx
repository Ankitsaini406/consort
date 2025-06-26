"use client";
import React from 'react';
import { SolutionForm } from './form/components/SolutionForm';
import { AdminFormPageLayout } from '../forms/layouts/AdminFormPageLayout';

export default function SolutionFormPage() {
    return (
        <AdminFormPageLayout>
            <SolutionForm />
        </AdminFormPageLayout>
    );
}