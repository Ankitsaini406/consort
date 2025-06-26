interface ServiceData {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  benefits: string[];
}

export const servicesData: ServiceData[] = [
  {
    id: 'mission-critical-communications',
    title: 'Mission Critical Communications',
    subtitle: 'Reliable communication solutions for emergency services and critical operations.',
    slug: 'mission-critical-communications',
    benefits: [
      'Instant push-to-talk communication',
      'Guaranteed 99.9% network availability',
      'Emergency alarm capabilities'
    ]
  },
  {
    id: 'radio-infrastructure',
    title: 'Radio Infrastructure',
    subtitle: 'Complete radio infrastructure solutions from design to maintenance.',
    slug: 'radio-infrastructure',
    benefits: [
      'Custom network design',
      'Professional installation',
      'Comprehensive testing'
    ]
  },
  {
    id: 'control-room-solutions',
    title: 'Control Room Solutions',
    subtitle: 'Integrated control room and dispatch solutions.',
    slug: 'control-room-solutions',
    benefits: [
      'Multi-channel dispatch capabilities',
      'Real-time incident tracking',
      'System integration'
    ]
  },
  {
    id: 'system-integration',
    title: 'System Integration',
    subtitle: 'Seamless integration services for unified operations.',
    slug: 'system-integration',
    benefits: [
      'API-based integration',
      'Legacy system modernization',
      'Custom middleware development'
    ]
  },
  {
    id: 'training-support',
    title: 'Training & Support',
    subtitle: 'Comprehensive training programs and technical support.',
    slug: 'training-support',
    benefits: [
      'Customized training programs',
      'Technical documentation',
      'Dedicated support team'
    ]
  },
  {
    id: 'fleet-management',
    title: 'Fleet Management',
    subtitle: 'Advanced fleet management and tracking solutions.',
    slug: 'fleet-management',
    benefits: [
      'Real-time vehicle tracking',
      'Route optimization',
      'Driver behavior monitoring'
    ]
  },
  {
    id: 'data-solutions',
    title: 'Data Solutions',
    subtitle: 'Data management and analytics services.',
    slug: 'data-solutions',
    benefits: [
      'Real-time data visualization',
      'Predictive analytics',
      'Secure cloud storage'
    ]
  },
  {
    id: 'network-security',
    title: 'Network Security',
    subtitle: 'Advanced cybersecurity for mission-critical networks.',
    slug: 'network-security',
    benefits: [
      'End-to-end encryption',
      'Threat detection systems',
      'Security audits'
    ]
  },
  {
    id: 'managed-services',
    title: 'Managed Services',
    subtitle: 'Complete outsourced infrastructure management.',
    slug: 'managed-services',
    benefits: [
      '24/7 system monitoring',
      'Predictive maintenance',
      'Service level agreements'
    ]
  }
]; 