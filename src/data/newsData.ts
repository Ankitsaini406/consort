export interface ContentBlock {
    type: 'paragraph' | 'heading' | 'image' | 'list';
    text?: string;
    src?: string;
    alt?: string;
    items?: string[];
}

export interface Update {
    image: string;
    title: string;
    description: string;
    url: string;
    tags: string[];
    publishDate: string;
    content: ContentBlock[];
}

// Expanded data for demonstration purposes
export const allUpdates: Update[] = [
    { 
        image: "/maritime-image.avif", 
        title: "Consort acquires Inative Networks", 
        description: "Resource deployment during critical incidents and disasters.", 
        url: "/news/consort-acquires-inative-networks", 
        tags: ["Acquisition", "Strategy"],
        publishDate: "2024-06-01",
        content: [
            { type: 'paragraph', text: 'Consort Digital is pleased to announce the successful acquisition of Inative Networks, a leader in crisis communication technology. This strategic move will enhance our capabilities in providing robust, integrated solutions for public safety and critical infrastructure.' },
            { type: 'heading', text: 'A New Era of Integrated Communications' },
            { type: 'paragraph', text: 'The integration of Inative Networks\' technology with our MCX ONE™ platform will create a comprehensive ecosystem for mission-critical operations. This synergy will enable seamless communication and data sharing between field operatives and command centers, improving response times and operational efficiency.' },
            { type: 'image', src: 'https://res.cloudinary.com/subframe/image/upload/v1747902182/uploads/12970/hfhiuuw7xo0mp1nojstx.webp', alt: 'Integration Diagram' },
            { type: 'list', items: ['Enhanced situational awareness', 'Unified voice, video, and data', 'Improved cross-agency collaboration'] }
        ]
    },
    { 
        image: "/helicopter-image.avif", 
        title: "New Partnership with AeroCorp", 
        description: "Enhancing aerial communication capabilities.", 
        url: "/news/new-partnership-with-aerocorp", 
        tags: ["Partnership", "Aviation"],
        publishDate: "2024-05-20",
        content: [
            { type: 'paragraph', text: 'We have entered into a strategic partnership with AeroCorp to revolutionize aerial communication systems. This collaboration will focus on developing next-generation solutions for aviation, including drones and helicopters.' }
        ]
    },
    { 
        image: "/train-image.avif", 
        title: "LTE Rollout for National Railway", 
        description: "Upgrading communication infrastructure for the national railway.", 
        url: "/news/lte-rollout-for-national-railway", 
        tags: ["LTE", "Transport"],
        publishDate: "2024-05-15",
        content: [
             { type: 'paragraph', text: 'The national railway is set to receive a significant upgrade to its communication infrastructure with our cutting-edge LTE solutions. The project will cover over 2,000 kilometers of track, ensuring reliable connectivity for operations and passenger services.' }
        ]
    },
    { 
        image: "/public-safety.avif", 
        title: "Public Safety Summit 2024", 
        description: "Showcasing next-gen communication solutions.", 
        url: "/news/public-safety-summit-2024", 
        tags: ["Event", "Public Safety"],
        publishDate: "2024-04-28",
        content: [
            { type: 'paragraph', text: 'Join us at the Public Safety Summit 2024, where we will be demonstrating the latest advancements in mission-critical communication technology. Visit our booth to learn how MCX ONE™ is empowering first responders.' }
        ]
    },
    { 
        image: "/airport-image.avif", 
        title: "Consort Digital at Airport Expo", 
        description: "Presenting MCX ONE for ground operations.", 
        url: "/news/consort-digital-at-airport-expo", 
        tags: ["Expo", "Aviation"],
        publishDate: "2024-04-10",
        content: [
             { type: 'paragraph', text: 'We will be at the Airport Expo to showcase how MCX ONE™ can streamline ground operations, enhance security, and improve passenger experience. We look forward to seeing you there.' }
        ]
    },
    { 
        image: "/maritime-image.avif", 
        title: "Maritime Security Conference", 
        description: "Discussing the future of secure maritime comms.", 
        url: "/news/maritime-security-conference", 
        tags: ["Conference", "Maritime"],
        publishDate: "2024-03-22",
        content: [
            { type: 'paragraph', text: 'Our experts will be speaking at the Maritime Security Conference on the challenges and opportunities in securing maritime communications. The talk will cover topics such as encryption, satellite connectivity, and IoT integration.' }
        ]
    },
    { 
        image: "/helicopter-image.avif", 
        title: "HDCS Deployed on Offshore Rigs", 
        description: "Improving safety and efficiency on oil rigs.", 
        url: "/news/hdcs-deployed-on-offshore-rigs", 
        tags: ["Deployment", "Oil & Gas"],
        publishDate: "2024-03-05",
        content: [
            { type: 'paragraph', text: 'Our Helicopter Deck Communication System (HDCS) has been successfully deployed on five offshore rigs in the North Sea. The system is providing reliable, hands-free communication for deck crews, significantly improving safety and operational efficiency.' }
        ]
    },
    { 
        image: "/train-image.avif", 
        title: "Smart Metro Communication System", 
        description: "A case study on urban transit solutions.", 
        url: "/news/smart-metro-communication-system", 
        tags: ["Case Study", "Mass Transit"],
        publishDate: "2024-02-18",
        content: [
            { type: 'paragraph', text: 'This case study explores the implementation of our smart communication system in a major metropolitan metro network. The study details the challenges, solutions, and outcomes, including a 30% reduction in communication-related delays.' }
        ]
    },
    { 
        image: "/public-safety.avif", 
        title: "Emergency Response Network Upgrade", 
        description: "Supporting first responders with reliable tech.", 
        url: "/news/emergency-response-network-upgrade", 
        tags: ["Upgrade", "Public Safety"],
        publishDate: "2024-02-01",
        content: [
            { type: 'paragraph', text: 'We have completed a major upgrade of the emergency response network for the state police. The new system provides enhanced coverage, capacity, and security, ensuring first responders have the reliable communication they need in any situation.' }
        ]
    },
    { 
        image: "/airport-image.avif", 
        title: "New SDK for Airport Logistics", 
        description: "Enabling developers to build integrated apps.", 
        url: "/news/new-sdk-for-airport-logistics", 
        tags: ["SDK", "Aviation"],
        publishDate: "2024-01-25",
        content: [
            { type: 'paragraph', text: 'Our new SDK for airport logistics is now available. The SDK provides developers with the tools they need to build custom applications that integrate with our MCX ONE™ platform, enabling a wide range of solutions for baggage handling, ground crew management, and more.' }
        ]
    },
    { 
        image: "/maritime-image.avif", 
        title: "Inative Networks Integration Complete", 
        description: "Synergies unlocked for crisis command.", 
        url: "/news/inative-networks-integration-complete", 
        tags: ["Integration", "Acquisition"],
        publishDate: "2024-01-10",
        content: [
            { type: 'paragraph', text: 'The technical integration of Inative Networks is now complete. Our combined teams are already working on new solutions that leverage our shared expertise to provide unparalleled capabilities for crisis command and control.' }
        ]
    },
    { 
        image: "/helicopter-image.avif", 
        title: "AeroCorp Partnership: Phase 2", 
        description: "Expanding joint R&D efforts.", 
        url: "/news/aerocorp-partnership-phase-2", 
        tags: ["Partnership", "R&D"],
        publishDate: "2023-12-15",
        content: [
            { type: 'paragraph', text: 'We are excited to announce the second phase of our partnership with AeroCorp. This phase will focus on joint research and development of next-generation aerial communication technologies, with a particular emphasis on AI-driven data analysis.' }
        ]
    },
    { 
        image: "/train-image.avif", 
        title: "High-Speed Rail Comms Trial", 
        description: "Testing next-gen connectivity at 300km/h.", 
        url: "/news/high-speed-rail-comms-trial", 
        tags: ["Trial", "Transport"],
        publishDate: "2023-11-20",
        content: [
            { type: 'paragraph', text: 'We have successfully completed a trial of our next-generation communication system on a high-speed train traveling at 300km/h. The trial demonstrated the system\'s ability to provide seamless, high-bandwidth connectivity for both operational and passenger services.' }
        ]
    },
    { 
        image: "/public-safety.avif", 
        title: "Consort Wins Public Safety Award", 
        description: "Recognized for innovation in critical comms.", 
        url: "/news/consort-wins-public-safety-award", 
        tags: ["Award", "Innovation"],
        publishDate: "2023-10-28",
        content: [
            { type: 'paragraph', text: 'We are honored to receive the Public Safety Innovator of the Year award. This award is a testament to our team\'s dedication to developing cutting-edge solutions that help first responders save lives.' }
        ]
    },
    { 
        image: "/airport-image.avif", 
        title: "MCX ONE Platform Update v2.5", 
        description: "New features for analytics and reporting.", 
        url: "/news/mcx-one-platform-update-v2-5", 
        tags: ["Update", "Platform"],
        publishDate: "2023-10-05",
        content: [
            { type: 'paragraph', text: 'Version 2.5 of our MCX ONE™ platform is now available. This update includes a range of new features, including advanced analytics, customizable reporting dashboards, and enhanced security protocols.' }
        ]
    }
]; 