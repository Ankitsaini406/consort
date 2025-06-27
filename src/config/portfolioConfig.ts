// Portfolio configuration - Single source of truth for all portfolio tabs
// Used by both menu generation and portfolio page

export interface PortfolioTabConfig {
    id: string;
    title: string;
    heroTitle: string;
    description: string;
    image: string;
    stats: { value: string; label: string; }[];
}

// Single source of truth for portfolio categories
export const PORTFOLIO_CATEGORIES = [
    { value: "devices", label: "Devices" },
    { value: "appssdk", label: "Apps & SDKs" },
    { value: "platform", label: "Platform" }, // ✅ Fixed: Singular form
    { value: "networks", label: "Networks" },
    { value: "extensions", label: "Extensions" },
    // Note: "all" is auto-generated, not selectable in forms
];

export const PORTFOLIO_TABS: Record<string, PortfolioTabConfig> = {
    all: {
        id: 'all',
        title: 'Overview',
        heroTitle: "Our Product Portfolio",
        description: "An integrated ecosystem of hardware, software, and network solutions, built on open standards to ensure reliability and interoperability for mission-critical operations.",
        image: '/allproducts.png',
        stats: [
            { value: "100+", label: "Products" },
            { value: "5", label: "Core Categories" },
            { value: "10+", label: "Countries" },
        ],
    },
    devices: {
        id: "devices",
        title: "Devices",
        heroTitle: "Rugged Devices",
        description: "Rugged, MCX-ready built to withstand the harshest environments, ensuring reliable communication when it matters most.",
        image: "/devices-red.svg",
        stats: [
            { value: "50+", label: "Products" },
            { value: "12", label: "Use Cases" },
            { value: "30+", label: "Accessories" },
        ],
    },
    appssdk: {
        id: "appssdk",
        title: "Apps & SDKs",
        heroTitle: "Apps & SDKs",
        description: "Intuitive apps and developer tools for seamless MCX integration, enabling custom solutions and enhanced operational control.",
        image: "/sdk-red.svg",
        stats: [
            { value: "10+", label: "Applications" },
            { value: "4", label: "SDKs" },
            { value: "100+", label: "Integrations" },
        ],
    },
    platform: {
        id: "platform",
        title: "Platform", // ✅ Consistent with PORTFOLIO_CATEGORIES
        heroTitle: "MCX ONE Platform",
        description: "Open, scalable platform for voice, data, & video. The core of our ecosystem, providing centralized control and interoperability.",
        image: "/platform-red.svg",
        stats: [
            { value: "99.999%", label: "Uptime" },
            { value: "1M+", label: "Users" },
            { value: "Flexible", label: "Architecture" },
        ],
    },
    networks: {
        id: "networks",
        title: "Networks",
        heroTitle: "Networks & Connectivity",
        description: "Secure, high-availability LTE 4G, 5G & TETRA network solutions ensuring your communications are always online.",
        image: "/networks-red.svg",
        stats: [
            { value: "4G/5G", label: "Broadband" },
            { value: "TETRA", label: "Radio" },
            { value: "Private", label: "Networks" },
        ],
    },
    extensions: {
        id: "extensions",
        title: "Extensions",
        heroTitle: "Industry Extensions",
        description: "Industry-specific modules for critical operational needs, extending the functionality of our core platform for specialized use cases.",
        image: "/extensions-red.svg",
        stats: [
            { value: "15+", label: "Extensions" },
            { value: "6+", label: "Industries" },
            { value: "Custom", label: "Development" },
        ],
    },
};

// Helper function to get portfolio menu items (excludes 'all' tab)
export function getPortfolioMenuItems() {
    return Object.values(PORTFOLIO_TABS)
        .filter(tab => tab.id !== 'all') // Exclude overview from menu dropdown
        .map(tab => ({
            title: tab.title,
            url: `/portfolio?tab=${tab.id}`,
            description: tab.description,
        }));
} 