// src/data/menuConfig.ts
import { MenuItem } from "@/components/layout/Header"; // adjust path if needed
import { fetchAllIndustries } from "@/app/industries/[slug]/action";
import { validateIndustriesArray, checkForDuplicateSlugs, sanitizeIndustryForMenu } from "@/utils/industryValidation";
import { getPortfolioMenuItems } from "@/config/portfolioConfig";
import { getServicesMenuItems } from "@/config/servicesConfig";

// Static menu configuration (fallback for when dynamic generation fails)
export const staticMenu: MenuItem[] = [
  {
    title: "Portfolio",
    url: "/portfolio",
    featured: {
      title: "Our Portfolio",
      description: "Discover our end-to-end solutions for mission-critical communication.",
      url: "/portfolio",
    },
    items: getPortfolioMenuItems(),
  },
  {
    title: "Industries",
    url: "#",
    featured: {
      title: "Diverse Industries",
      description: "Solutions customized for diverse industrial needs.",
      url: "/industries/oil-gas",
    },
    items: [
      {
        title: "Oil & Gas",
        url: "/industries/oil-gas",
        description: "Hazardous zone-ready communications",
      },
      {
        title: "Public Safety",
        url: "/industries/public-safety",
        description: "Emergency coordination platforms",
      },
      {
        title: "Healthcare",
        url: "/industries/healthcare",
        description: "ICU and critical room safety",
      },
      {
        title: "Infrastructure",
        url: "/industries/infrastructure",
        description: "Critical infrastructure protection",
      },
      {
        title: "Mining",
        url: "/industries/mining",
        description: "Safety and productivity in harsh environments",
      },
      {
        title: "Maritime",
        url: "/industries/maritime",
        description: "Safe and efficient maritime operations",
      },
      {
        title: "Mass Transit",
        url: "/industries/mass-transit",
        description: "Safe and efficient mass transit operations",
      },
    ],
  },
  {
    title: "Resources",
    url: "#",
    featured: {
      title: "Knowledge Hub",
      description: "Explore our collection of case studies, news, and events.",
      url: "/posts/events",
    },
    items: [
      {
        title: "News",
        url: "/posts/news",
        description: "Latest updates, announcements, and media coverage from Consort Digital",
      },
      {
        title: "Events",
        url: "/posts/events",
        description: "Upcoming events, conferences, and past industry engagements",
      },
      {
        title: "Case Studies",
        url: "/resources/case-study",
        description: "Real-world implementations and success stories from Public Safety to Mass Transit, Oil & Gas to Maritime",
      },
      {
        title: "Client Reviews",
        url: "/resources/client-review",
        description: "Testimonials and reviews from our valued clients and partners",
      },
      {
        title: "Whitepapers",
        url: "/resources/whitepaper",
        description: "In-depth technical papers and research from Mission Critical Communications experts",
      },
      {
        title: "Blog Posts",
        url: "/posts/blog-post",
        description: "Ideas, insights & knowledge derived from 20+ years of building Mission Critical Communication Systems",
      },
      {
        title: "Announcements",
        url: "/posts/announcements",
        description: "Company updates, partnerships, projects, and latest contract announcements",
      },
    ],
  },
  {
    title: "Services",
    url: "/services",
    featured: {
      title: "Critical Services",
      description: "From initial design to ongoing support, we provide end-to-end communication solutions tailored to your mission-critical requirements.",
      url: "/services",
    },
    items: getServicesMenuItems(),
  },
//   {
//     title: "About",
//     url: "/about",
//   },
];

// Build-time dynamic menu generation with industries from database
export async function generateMenuWithIndustries(): Promise<MenuItem[]> {
  try {
    console.log('[menuConfig] Generating menu at build time...');
    
    // Fetch all industries from database using server-side Firebase
    const industries = await fetchAllIndustries();
    
    if (!Array.isArray(industries)) {
      console.error('[menuConfig] fetchAllIndustries did not return an array, using static menu');
      return staticMenu;
    }
    
    // Validate all industries and get comprehensive report
    const validationResult = validateIndustriesArray(industries);
    
    // Check for duplicate slugs
    const duplicateSlugs = checkForDuplicateSlugs(industries);
    if (duplicateSlugs.length > 0) {
      console.error('[menuConfig] Duplicate slugs detected:', duplicateSlugs);
    }
    
    // Log validation summary
    console.log('[menuConfig] Validation summary:', validationResult.summary);
    
    // Filter valid, published industries
    const publishedIndustries = validationResult.validIndustries.filter(industry => !industry.isDraft);
    
    // Transform industry data to menu items using sanitization utility
    const industryMenuItems = publishedIndustries.map(industry => sanitizeIndustryForMenu(industry));

    // Create the dynamic menu by replacing the Industries section
    const dynamicMenu = staticMenu.map(section => {
      if (section.title === "Industries") {
        return {
          ...section,
          items: industryMenuItems,
        };
      }
      return section;
    });

    console.log(`[menuConfig] Successfully generated build-time menu with ${industryMenuItems.length} industry items`);
    return dynamicMenu;
    
  } catch (error) {
    console.error('[menuConfig] Failed to generate build-time menu, falling back to static menu:', error);
    
    // Enhanced error reporting for debugging
    if (process.env.NODE_ENV === 'development') {
      const errorDetails = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      } : {
        message: String(error),
        timestamp: new Date().toISOString()
      };
      console.error('[menuConfig] Error details:', errorDetails);
    }
    
    // Fallback to static menu if there's an error
    return staticMenu;
  }
}

// Default export - static menu for immediate use (fallback)
export const menu = staticMenu;

