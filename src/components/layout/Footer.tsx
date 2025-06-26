import React from "react";
import { Button3 } from "@/ui/components/Button3";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherTwitter, FeatherLinkedin, FeatherGithub } from "@subframe/core";
import Link from "next/link";
import CommonCTA from "../CommonCTA";

// Type definitions for footer data structure
interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

interface FooterCategory {
  title: string;
  links: FooterLink[];
  hasPattern?: boolean;
}

interface FooterLinks {
  [key: string]: FooterCategory;
}

// Footer links data structure for easy management
const footerLinks: FooterLinks = {
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" }
    ]
  },
  resources: {
    title: "Resources",
    hasPattern: true,
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Help Center", href: "/help" },
      { label: "News & Events", href: "/news" },
      { label: "Whitepapers", href: "/whitepapers" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "News & Events", href: "/events", badge: "New" }
    ]
  },
  industries: {
    title: "Industries",
    links: [
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "Finance", href: "/industries/finance" },
      { label: "Education", href: "/industries/education" },
      { label: "Maritime", href: "/industries/maritime" },
      { label: "Mass Transit", href: "/industries/mass-transit" },
      { label: "Mining", href: "/industries/mining" },
      { label: "Oil & Gas", href: "/industries/oil-gas" }
    ]
  },
  services: {
    title: "Services",
    links: [
      { label: "Products", href: "/products" },
      { label: "Solutions", href: "/solution" },
      { label: "Consulting", href: "/consulting" },
      { label: "Support", href: "/support" }
    ]
  }
};

interface FooterProps {
  hideCommonCTA?: boolean;
}

export default function Footer({ hideCommonCTA = false }: FooterProps) {
  return (
    <div className="bg-gradient-to-t from-neutral-100  to-white">
      {hideCommonCTA === false && <CommonCTA />}
      <div className="relative mt-24 bg-gradient-to-t from-[#212A59] to-brand-900">
        <svg
          className="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-brand-900"
          preserveAspectRatio="none"
          viewBox="0 0 1440 54"
        >
          <path
            fill="currentColor"
            d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
          />
        </svg>
        <div className="px-4 pt-24 mx-auto sm:max-w-xl md:max-w-full lg:max-w-[1024px] md:px-16 lg:px-8">
          <div className="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
            <div className="lg:max-w-md lg:col-span-2 text-center lg:text-left">
              <Link
                href="/"
                aria-label="Go home"
                title="Consort Digital"
                className="inline-flex items-center justify-center lg:justify-start"
              >
                <img src="/Consort-White.svg"
                  alt="Consort Digital"
                  className="w-auto h-7" />
              </Link>
              <div className="mt-4 lg:max-w-sm">
                <p className="text-body-lg font-body text-amber-300 mobile:text-center lg:text-left">
                  #TrustYourResponse
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 mobile:gap-6 md:grid-cols-4 md:gap-16 mobile:w-[90%] md:max-w-[90%] mx-auto lg:col-span-4">
              {Object.entries(footerLinks).map(([key, category]) => (
                <div key={key}>
                  <p className="font-body text-brand-200 text-sm mb-5">
                    {category.title}
                  </p>
                  <ul className="mt-2 space-y-3 mobile:space-y-2">
                    {category.links.map((link, index) => (
                      <li key={index} className={link.badge ? "flex items-center gap-2" : ""}>
                        <Link
                          href={link.href}
                          className="text-white/75 hover:text-amber-300 transition-colors duration-300 text-sm font-medium"
                        >
                          {link.label}
                        </Link>
                        {link.badge && (
                          <BadgeConsort variant="warning" variant2="small" className="text-xs">
                            {link.badge}
                          </BadgeConsort>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 flex flex-col justify-between py-8 border-t border-neutral-200/20 sm:flex-row">
            <p className="text-caption font-caption text-neutral-200">
              © Copyright {new Date().getFullYear()} Consort Digital. All rights reserved.
            </p>
            <div className="flex items-center mt-4 space-x-6 sm:mt-0">
              <IconButton
                icon={<FeatherTwitter />}
                variant="inverse"
                size="medium"
                onClick={() => window.open("https://x.com/consortd", "_blank")}
                className="text-white/75 hover:text-amber-300 transition-colors duration-300"
              />
              <IconButton
                icon={<FeatherLinkedin />}
                variant="inverse"
                size="medium"
                onClick={() => window.open("https://www.linkedin.com/company/consort-digital/", "_blank")}
                className="text-white/75 hover:text-amber-300 transition-colors duration-300"
              />
              <IconButton
                icon={<FeatherGithub />}
                variant="inverse"
                size="medium"
                onClick={() => window.open("https://github.com/ConsortDigital", "_blank")}
                className="text-white/75 hover:text-amber-300 transition-colors duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


