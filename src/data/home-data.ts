// Types for better type safety and performance
interface NewsUpdate {
  readonly image: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly tags: readonly string[];
}

interface AdvanceItem {
  readonly title: string;
  readonly subtitle: string;
  readonly src: string;
  readonly alt: string;
  readonly badges: readonly { 
    readonly text: string; 
    readonly variant: 'warning' | 'brand' | 'neutral' | 'success' | 'dark'; 
  }[];
}

interface HeroIndustry {
  readonly name: string;
  readonly description: string;
  readonly icon: string;
}

interface HeroStat {
  readonly countX: string;
  readonly label: string;
}

interface HighlighterConfig {
  readonly color: string;
  readonly opacity: number;
  readonly strokeWidth: number;
  readonly height: string;
  readonly verticalOffset: string;
  readonly animationDelay: number;
  readonly animationDuration: number;
  readonly naturalness: number;
}

export const updates: readonly NewsUpdate[] = [
    {
      image: "/Consort_Jun_4_1-768x380.webp",
      title: "Consort Digital and Druid Software Partner to Deliver 3GPP-Compliant Mission-Critical Communication Solutions",
      description: "Event - June 2025",
      url: "/",
      tags: ["Partnership", "MCX"],
    }, {
      image: "/News_3.jpg",
      title: "Consort Awarded Contract to Deploy MCX ONE at Navi Mumbai International Airport Limited",
      description: "Announcement - June 2025.",
      url: "/",
      tags: ["Airport", "MCXONE"],
    }, {
      image: "/news_2.jpg",
      title: "Consort wins contract to deploy MCX ONE for BMRCL Reach-6, Phase 2A & 2B Corridors",
      description: "Announcement - May 2025.",
      url: "/",
      tags: ["Mass Transit", "MCXONE"],
    },
    {
      image: "/ccw2025.avif",
      title: "Experience Next-Gen Mission Critical Communication at CCW 2025 with Consort Digital​",
      description: "Event - June 2025",
      url: "/",
      tags: ["CCW25", "Exhibition"],
    },
    {
      image: "/news_5.webp",
      title: "Consort acquires Inative Networks",
      description: "Announcement - June 2025",
      url: "/",
      tags: ["Acquisition", "MCX"],
    },
  ] as const;
  

  
  export const advance: readonly AdvanceItem[] = [
    {
      title: " Reliable Communication for Oil & Gas Operations",
      subtitle: "DMR - TETRA - MCX",
      src: "/oilgas.avif",
      alt: "MCX for Refineries",
      badges: [
        { text: "MCX ONE", variant: "warning" as const },
        { text: "LTE", variant: "brand" as const }
      ]
    },
    {
      title: "Driving Seamless Communication in Transport with MCX ONE",
      subtitle: "DMR - TETRA - MCX",
      src: "/train-2.avif",
      alt: "LTE for Metro Trains",
      badges: [
        { text: "DMR", variant: "warning" as const },
        { text: "Mass Transit", variant: "brand" as const },
        { text: "TETRA", variant: "neutral" as const }
      ]
    },
    {
      title: "Transorming Public Safety with MCX ONE",
      subtitle: "Critical Communication Solution",
      src: "/fire.avif",
      alt: "Public Safety",
      badges: [
        { text: "Public Safety", variant: "neutral" as const },
        { text: "MCXONE", variant: "warning" as const }
      ]
    },    {
      title: "Helo Deck Communication System (HDCS)",
      subtitle: "DMR - TETRA - MCX",
      src: "/helicopter-image.avif",
      alt: "Helicopter Deck Communication",
      badges: [
        { text: "HELO", variant: "neutral" as const },
        { text: "MCX", variant: "brand" as const }
      ]
    },
    {
      title: "MCX ONE™ for Smooth & Secure Airport Operations",
      subtitle: "DMR - TETRA - MCX",
      src: "/airport-image.avif",
      alt: "Airport Ground Operations",
      badges: [
        { text: "Airport", variant: "neutral" as const },
        { text: "MCXONE", variant: "success" as const }
      ]
    },
    {
      title: "Transorming Mining operation with MCX ONE",
      subtitle: "DMR - TETRA - MCX",
      src: "/mining.jpg",
      alt: "TETRA Radio for OITDS",
      badges: [
        { text: "Oil & Gas", variant: "warning" as const },
        { text: "TETRA", variant: "success" as const }
      ]
    },
  
  ] as const;
  
  export const heroIndustries: readonly HeroIndustry[] = [
    {
      name: "Maritime",
      description: "10+ Solutions",
      icon: "/icons/maritime.svg",
    },
    {
      name: "Infrastructure",
      description: "12+ Solutions",
      icon: "/icons/infra.svg",
    },
    {
      name: "Oil & Gas",
      description: "8+ Solutions",
      icon: "/icons/oil.svg",
    },
    {
      name: "Public Safety",
      description: "5+ Solutions",
      icon: "/icons/public-safety.svg",
    },
  ] as const;
  
  
  export const heroStats: readonly HeroStat[] = [
    { countX: "100+", label: "Critical Projects Deployed" },
    { countX: "20+", label: "Years of \nExperience" },
    { countX: "35+", label: "Products in Portfolio" },
    { countX: "3M", label: "Mins of Critical Comms" },
  ] as const;
  

  
  // Highlighter configuration - easy to adjust
  export const highlighterConfig: HighlighterConfig = {
    color: '#50CEAA', // Neon light yellow
    opacity: 0.85, // Increased opacity for a firmer look
    strokeWidth: 12, // Adjusted for a clear, pen-like stroke
    height: '40%', // Adjusted height for an underline effect
    verticalOffset: '70%', // Adjusted to position it as an underline
    animationDelay: 1.0, // Slightly faster animation
    animationDuration: 0.8,
    naturalness: 1,
  } as const; 