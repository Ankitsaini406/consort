'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, FileText, Image, Tag, Building2, Calendar, CheckCircle2, AlertCircle, Info, LucideIcon } from 'lucide-react';
import { Button3 } from '@/ui/components/Button3';
import Link from 'next/link';
import { FeatherArrowLeft, FeatherArrowRight } from 'lucide-react';

// Demo data to simulate form data
const demoFormData = {
  productDetails: {
    productIndex: "AI-001",
    category: ["Healthcare", "Manufacturing"],
    subCategory: "Medical Devices",
    tags: ["AI", "Machine Learning", "IoT"],
    productName: "Smart Health Monitor Pro",
    briefHeadline: "Revolutionary AI-powered health monitoring system for continuous patient care",
    productPhotos: [{ name: "hero-image.jpg" }, { name: "product-shot-1.jpg" }]
  },
  productBrief: {
    briefDescription: "The Smart Health Monitor Pro leverages advanced AI algorithms to provide real-time health monitoring and predictive analytics. This comprehensive solution integrates seamlessly with existing healthcare infrastructure to deliver actionable insights for healthcare professionals.\n\nKey capabilities include continuous vital sign monitoring, anomaly detection, and automated alert systems that help prevent critical health events before they occur.",
    bulletPoints: [
      { id: 1, content: "Real-time vital sign monitoring with 99.9% accuracy" },
      { id: 2, content: "AI-powered predictive analytics for early intervention" },
      { id: 3, content: "Seamless integration with existing EMR systems" },
      { id: 4, content: "24/7 automated monitoring with intelligent alerts" }
    ]
  },
  resources: {
    datasheet: { file: { name: "smart-health-monitor-datasheet.pdf" } },
    brochure: { file: { name: "product-brochure-2024.pdf" } },
    caseStudies: { file: { name: "mayo-clinic-case-study.pdf" } }
  }
};

// Type definitions
interface SummaryCardProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  defaultExpanded?: boolean;
}

interface GridSummaryCardProps extends SummaryCardProps {
  icon: LucideIcon;
}

type StatusType = 'complete' | 'incomplete' | 'draft';

interface CompactSummaryCardProps extends SummaryCardProps {
  status?: StatusType;
}

interface FieldDisplayProps {
  label: string;
  value: any;
  type?: 'text' | 'textarea' | 'tags' | 'file' | 'files' | 'list';
  className?: string;
}

// Design Option 1: Clean Card Layout with Better Typography
const CleanSummaryCard: React.FC<SummaryCardProps> = ({ title, children, onEdit, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              {isExpanded ? <ChevronUp size={18} className="text-gray-600" /> : <ChevronDown size={18} className="text-gray-600" />}
            </button>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              <Edit2 size={14} />
              Edit
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="px-6 py-5">
          {children}
        </div>
      )}
    </div>
  );
};

// Design Option 2: Grid-based Layout with Icons
const GridSummaryCard: React.FC<GridSummaryCardProps> = ({ title, children, onEdit, icon: Icon, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Icon size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                {isExpanded ? 'Hide details' : 'Show details'}
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium shadow-sm"
            >
              <Edit2 size={14} />
              Edit
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Design Option 3: Compact List with Status Indicators
const CompactSummaryCard: React.FC<CompactSummaryCardProps> = ({ title, children, onEdit, status = 'complete', defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const statusConfig: Record<StatusType, { icon: LucideIcon; color: string; bg: string }> = {
    complete: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    incomplete: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    draft: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' }
  };
  
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${statusConfig[status].bg}`}>
              <StatusIcon size={16} className={statusConfig[status].color} />
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
            </button>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
};

// NEW: Hybrid Layout - Clean Accordion + Grid Content (NATIVE DESIGN SYSTEM)
const HybridSummaryCard: React.FC<SummaryCardProps> = ({ title, children, onEdit, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="w-full border border-neutral-border rounded-lg bg-white shadow-sm mb-4">
      <div className="px-6 py-4 border-b border-neutral-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              {isExpanded ? <ChevronUp size={20} className="text-subtext-color" /> : <ChevronDown size={20} className="text-subtext-color" />}
            </button>
            <h3 className="text-body-lg font-body-lg text-default-font">{title}</h3>
          </div>
          {onEdit && (
            <Button3
              variant="brand-tertiary"
              size="small"
              icon={<Edit2 size={14} />}
              onClick={onEdit}
            >
              EDIT
            </Button3>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Improved field display components using native design system
const FieldDisplay: React.FC<FieldDisplayProps> = ({ label, value, type = 'text', className = '' }) => {
  const renderValue = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-subtext-color italic">Not provided</span>;
    }

    switch (type) {
      case 'textarea':
        return <p className="text-body font-body text-default-font whitespace-pre-wrap leading-relaxed">{value}</p>;
      case 'tags':
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((tag: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-brand-50 text-consort-blue text-caption font-caption rounded-full">
                {tag}
              </span>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-2 text-default-font">
            <FileText size={16} className="text-subtext-color" />
            <span className="text-body font-body">{value}</span>
          </div>
        );
      case 'files':
        return (
          <div className="space-y-1">
            {value.map((file: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-default-font">
                <Image size={16} className="text-subtext-color" />
                <span className="text-body font-body">{file.name}</span>
              </div>
            ))}
          </div>
        );
      case 'list':
        return (
          <ul className="space-y-1">
            {value.map((item: any, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-subtext-color rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-body font-body text-default-font">{item.content || item}</span>
              </li>
            ))}
          </ul>
        );
      default:
        return <span className="text-body font-body text-default-font">{value}</span>;
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <dt className="text-caption font-caption text-subtext-color font-medium">{label}</dt>
      <dd>{renderValue()}</dd>
    </div>
  );
};

const GridFieldDisplay: React.FC<FieldDisplayProps> = ({ label, value, type = 'text' }) => {
  return (
    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-border">
      <FieldDisplay label={label} value={value} type={type} />
    </div>
  );
};

const CompactFieldDisplay: React.FC<FieldDisplayProps> = ({ label, value, type = 'text' }) => {
  const renderValue = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-subtext-color">—</span>;
    }

    switch (type) {
      case 'tags':
        return <span className="text-body font-body text-default-font">{value.join(', ')}</span>;
      case 'file':
        return <span className="text-body font-body text-default-font">{value}</span>;
      case 'files':
        return <span className="text-body font-body text-default-font">{value.length} file(s)</span>;
      default:
        return <span className="text-body font-body text-default-font">{value}</span>;
    }
  };

  return (
    <div className="flex justify-between items-start py-2 border-b border-neutral-border last:border-b-0">
      <span className="text-caption font-caption text-subtext-color font-medium w-1/3">{label}:</span>
      <span className="w-2/3 text-right">{renderValue()}</span>
    </div>
  );
};

export default function UIDemoPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FeatherArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">UI Components Demo</h1>
          <p className="text-gray-600 mt-2">Test and preview UI components used throughout the application</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoComponents.map((component, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{component.title}</h3>
                <component.icon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4">{component.description}</p>
              <Link 
                href={component.path}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Demo
                <FeatherArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 