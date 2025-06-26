// Services configuration - Single source of truth for all service content
// Used by menu generation, services grid, and individual service pages

export interface ServiceConfig {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    benefits: string[];
    slug: string;
    heroImage: string;
    overview: string;
}

// Unified services data - single source of truth
export const SERVICES_DATA: ServiceConfig[] = [
    {
        id: 'design-engineering',
        title: 'Design & Engineering',
        subtitle: 'Ensures reliability and aligns features with customer requirements.',
        description: 'Professional design and engineering services for mission-critical communication systems.',
        benefits: [
            'Custom system design tailored to operational needs',
            'Reliability-first engineering approach',
            'Feature alignment with customer specifications',
            'Comprehensive documentation and specifications',
            'Scalable architecture for future growth'
        ],
        slug: 'design-engineering',
        heroImage: 'https://res.cloudinary.com/subframe/image/upload/v1747756912/uploads/12970/sfmokcbeuk8r2ljvfzh2.avif',
        overview: 'Our design and engineering services ensure your communication systems are built with reliability and efficiency in mind. We create custom solutions that perfectly align with your operational requirements.'
    },
    {
        id: 'coverage-analysis',
        title: 'Coverage Analysis',
        subtitle: 'Accurate coverage predictions and efficient spectrum planning.',
        description: 'Comprehensive RF coverage analysis and spectrum optimization services.',
        benefits: [
            'Precise RF coverage modeling and predictions',
            'Optimal spectrum utilization strategies',
            'Interference analysis and mitigation',
            'Terrain-based coverage optimization',
            'Detailed coverage reports and recommendations'
        ],
        slug: 'coverage-analysis',
        heroImage: 'https://res.cloudinary.com/subframe/image/upload/v1747848163/uploads/12970/ejamcjl6w1pulyubod5y.avif',
        overview: 'Our coverage analysis services provide accurate predictions and efficient spectrum planning to ensure optimal communication coverage across your operational areas.'
    },
    {
        id: 'integration-services', 
        title: 'Integration Services',
        subtitle: 'Seamless integration across technologies and systems.',
        description: 'Expert system integration services for unified communication platforms.',
        benefits: [
            'Multi-vendor system integration',
            'Legacy system modernization',
            'API-based connectivity solutions',
            'Custom middleware development',
            'End-to-end system testing'
        ],
        slug: 'integration-services',
        heroImage: 'https://res.cloudinary.com/subframe/image/upload/v1747759080/uploads/12970/ungklbj1eovabr3qlpuq.avif',
        overview: 'Seamless integration services that connect your communication systems with existing infrastructure, ensuring unified operations and maximum efficiency.'
    },
    {
        id: 'installation-commissioning',
        title: 'Installation & Commissioning',
        subtitle: 'Trouble-free installation with expert teams for mission-critical solutions.',
        description: 'Professional installation and commissioning services by certified experts.',
        benefits: [
            'Professional installation by certified experts',
            'Comprehensive system testing and validation',
            'Minimal operational disruption during deployment',
            'Detailed documentation and handover',
            'Post-installation support and training'
        ],
        slug: 'installation-commissioning',
        heroImage: 'https://res.cloudinary.com/subframe/image/upload/v1747848163/uploads/12970/ejamcjl6w1pulyubod5y.avif',
        overview: 'Professional installation and commissioning services delivered by certified experts, ensuring your communication systems are deployed with minimal disruption.'
    },
    {
        id: 'project-management',
        title: 'Project Management',
        subtitle: 'Delivers results by managing teams and meeting customer requirements.',
        description: 'End-to-end project management for mission-critical communication deployments.',
        benefits: [
            'End-to-end project lifecycle management',
            'Dedicated project managers and teams',
            'On-time delivery with quality assurance',
            'Risk management and mitigation',
            'Regular progress reporting'
        ],
        slug: 'project-management',
        heroImage: 'https://res.cloudinary.com/subframe/image/upload/v1747756912/uploads/12970/sfmokcbeuk8r2ljvfzh2.avif',
        overview: 'End-to-end project management services that ensure your communication projects are delivered on time, within budget, and to the highest quality standards.'
    },
    {
        id: 'support-services',
        title: 'Support Services',
        subtitle: 'Assists operations and maintenance in normal and emergency situations.',
        description: '24/7 technical support and maintenance services for communication systems.',
        benefits: [
            '24/7 technical support and monitoring',
            'Emergency response and troubleshooting',
            'Preventive maintenance programs',
            'Regular system health checks',
            'Performance optimization'
        ],
        slug: 'support-services',
        heroImage: '/train-2.avif',
        overview: 'Comprehensive support services that keep your communication systems running smoothly, with rapid response to any issues that may arise.'
    },
    {
        id: 'managed-services',
        title: 'Managed Services',
        subtitle: 'End-to-end solution management letting users focus on core business.',
        description: 'Complete outsourced management of communication infrastructure and operations.',
        benefits: [
            'Complete infrastructure management',
            'Proactive monitoring and optimization',
            'Cost-effective outsourced operations',
            'Regular performance reporting',
            'Predictive maintenance'
        ],
        slug: 'managed-services',
        heroImage: '/fire.avif',
        overview: 'Complete managed services that take care of your entire communication infrastructure, allowing you to focus on your core business operations.'
    },
    {
        id: 'application-development',
        title: 'Application Development',
        subtitle: 'Custom applications across industries and standards.',
        description: 'Bespoke software development for mission-critical communication needs.',
        benefits: [
            'Industry-specific software solutions',
            'Standards-compliant application development',
            'Cross-platform compatibility and integration',
            'User-friendly interfaces',
            'Comprehensive documentation'
        ],
        slug: 'application-development',
        heroImage: 'https://res.cloudinary.com/subframe/image/upload/v1747759080/uploads/12970/ungklbj1eovabr3qlpuq.avif',
        overview: 'Custom application development services that create tailored solutions for your specific communication needs and industry requirements.'
    },
    {
        id: 'device-repair-services',
        title: 'Device Repair Services',
        subtitle: 'Maintenance and repair via certified technicians.',
        description: 'Professional device repair and maintenance by factory-certified technicians.',
        benefits: [
            'Factory-certified repair technicians',
            'Quick turnaround times with quality guarantee',
            'Genuine parts and comprehensive testing',
            'Preventive maintenance programs',
            'Extended warranty options'
        ],
        slug: 'device-repair-services',
        heroImage: 'https://res.cloudinary.com/subframe/image/upload/v1747848163/uploads/12970/ejamcjl6w1pulyubod5y.avif',
        overview: 'Professional device repair services delivered by certified technicians, ensuring your communication equipment is maintained to the highest standards.'
    }
];

// Data validation functions
export function validateServiceConfig(service: any): service is ServiceConfig {
    return (
        typeof service === 'object' &&
        service !== null &&
        typeof service.id === 'string' &&
        typeof service.title === 'string' &&
        typeof service.subtitle === 'string' &&
        typeof service.description === 'string' &&
        Array.isArray(service.benefits) &&
        service.benefits.every((benefit: any) => typeof benefit === 'string') &&
        typeof service.slug === 'string' &&
        typeof service.heroImage === 'string' &&
        typeof service.overview === 'string' &&
        service.slug.match(/^[a-z0-9-]+$/) // URL-safe slug validation
    );
}

export function validateServicesArray(services: any[]): {
    validServices: ServiceConfig[];
    invalidServices: any[];
    duplicateSlugs: string[];
    errors: string[];
} {
    const validServices: ServiceConfig[] = [];
    const invalidServices: any[] = [];
    const slugSet = new Set<string>();
    const duplicateSlugs: string[] = [];
    const errors: string[] = [];

    services.forEach((service, index) => {
        if (!validateServiceConfig(service)) {
            invalidServices.push(service);
            errors.push(`Service at index ${index} failed validation`);
            return;
        }

        if (slugSet.has(service.slug)) {
            duplicateSlugs.push(service.slug);
            errors.push(`Duplicate slug found: ${service.slug}`);
        } else {
            slugSet.add(service.slug);
        }

        validServices.push(service);
    });

    return { validServices, invalidServices, duplicateSlugs, errors };
}

// Helper function to get service menu items with error handling
export function getServicesMenuItems(): Array<{title: string; url: string; description: string}> {
    try {
        const validation = validateServicesArray(SERVICES_DATA);
        
        if (validation.errors.length > 0) {
            console.error('[getServicesMenuItems] Validation errors:', validation.errors);
        }

        return validation.validServices.map(service => ({
            title: service.title,
            url: `/services/${service.slug}`,
            description: service.description,
        }));
    } catch (error) {
        console.error('[getServicesMenuItems] Failed to generate menu items:', error);
        return []; // Return empty array instead of crashing
    }
}

// Helper function to get service by slug with proper error handling
export function getServiceBySlug(slug: string): ServiceConfig | null {
    try {
        if (!slug || typeof slug !== 'string') {
            console.error('[getServiceBySlug] Invalid slug provided:', slug);
            return null;
        }

        // Validate slug format
        if (!slug.match(/^[a-z0-9-]+$/)) {
            console.error('[getServiceBySlug] Invalid slug format:', slug);
            return null;
        }

        const service = SERVICES_DATA.find(service => service.slug === slug);
        
        if (!service) {
            console.warn(`[getServiceBySlug] Service not found for slug: ${slug}`);
            return null;
        }

        // Validate service before returning
        if (!validateServiceConfig(service)) {
            console.error(`[getServiceBySlug] Service validation failed for slug: ${slug}`);
            return null;
        }

        return service;
    } catch (error) {
        console.error(`[getServiceBySlug] Error retrieving service for slug ${slug}:`, error);
        return null;
    }
}

// Helper function to get all service slugs with validation
export function getServiceSlugs(): string[] {
    try {
        const validation = validateServicesArray(SERVICES_DATA);
        
        if (validation.errors.length > 0) {
            console.error('[getServiceSlugs] Validation errors:', validation.errors);
        }

        return validation.validServices.map(service => service.slug);
    } catch (error) {
        console.error('[getServiceSlugs] Failed to generate service slugs:', error);
        return []; // Return empty array to prevent build failure
    }
}

// Helper function to check data integrity at build time
export function validateServicesIntegrity(): boolean {
    try {
        const validation = validateServicesArray(SERVICES_DATA);
        
        if (validation.errors.length > 0) {
            console.error('[validateServicesIntegrity] CRITICAL: Services data validation failed:', validation.errors);
            return false;
        }

        if (validation.duplicateSlugs.length > 0) {
            console.error('[validateServicesIntegrity] CRITICAL: Duplicate slugs found:', validation.duplicateSlugs);
            return false;
        }

        console.log(`[validateServicesIntegrity] ✅ All ${validation.validServices.length} services validated successfully`);
        return true;
    } catch (error) {
        console.error('[validateServicesIntegrity] CRITICAL: Validation process failed:', error);
        return false;
    }
} 