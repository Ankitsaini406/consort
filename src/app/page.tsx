import React from 'react';
import { Button3 } from "@/ui/components/Button3";
import Link from 'next/link';
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import Image from 'next/image';
import IndustryFocus from '@/components/IndustryFocus';
import InteractiveIndustrySection from '@/components/InteractiveIndustrySection';
import { ContentCard1 } from '@/components/cards';
import {
  heroIndustries,
  heroStats,
} from '@/data/home-data';
import { fetchPostsByType } from '@/lib/firebase-actions';
import { Posts } from '@/types/types';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// ISR Configuration - Cache for 1 hour, but allow on-demand revalidation
export const revalidate = 3600;

// Get latest content from Firebase
async function getLatestContent() {
  try {
    const [latestNews, latestEvents] = await Promise.all([
      fetchPostsByType('news'),
      fetchPostsByType('events')
    ]);
    
    return {
      news: latestNews.slice(0, 3), // Latest 3 news
      events: latestEvents.slice(0, 3) // Latest 3 events
    };
  } catch (error) {
    console.error('Error fetching latest content:', error);
    return {
      news: [],
      events: []
    };
  }
}

// Data mapping function
const mapPostToCard = (post: Posts, type: 'news' | 'events') => ({
  image: post.heroImageUrl,
  title: post.postTitle,
  date: post.date,
  url: `/posts/${type}/${post.slug}`,
  tags: post.globalTags,
  type: 'post' as const
});

// Lightweight SVG icons - SSG optimized
const ArrowRight = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

export const metadata: Metadata = {
  title: 'Consort Digital MCX ONE™ – Secure, Scalable Mission‑Critical Communications',
  description: 'Consort Digital delivers MCX ONE™, a future-ready platform for secure, interoperable, and reliable mission-critical communications across TETRA, 4G/5G, and hybrid networks.',
  keywords: [
    'Consort Digital',
    'MCX ONE',
    'mission critical communications',
    'TETRA DMR 4G 5G hybrid MCX',
    'secure communications',
    'public safety communications',
    'dispatch console',
    'mission critical devices',
  ],
  openGraph: {
    title: 'Consort Digital MCX ONE™ – Secure & Scalable MCX Platform',
    description: 'MCX ONE™ by Consort Digital enables secure, mission-critical voice, video, and data services—trusted by critical operations globally.',
    url: 'https://www.consortdigital.com',
    siteName: 'Consort Digital',
    type: 'website',
    images: [
      {
        url: '/consort_OG.jpg',
        width: 1200,
        height: 630,
        alt: 'MCX ONE platform – mission-critical communication solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consort Digital MCX ONE™ – Secure & Scalable MCX Platform',
    description: 'Empowering mission-critical operations with consistent, secure, and scalable MCX communications solutions.',
    images: ['/consort_OG.jpg'],
  },
};


// Client-side components with consistent dynamic imports and loading states
const StaticHeroCarousel = dynamic(() => import('@/components/StaticHeroCarousel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[512px] bg-neutral-50 animate-pulse rounded-md flex items-center justify-center">
      <div className="text-sm text-gray-500">Loading carousel...</div>
    </div>
  )
});

const ClientScrollReveal = dynamic(() => import('@/components/client/ClientScrollReveal'), {
  ssr: false,
  loading: () => <div className="opacity-0">Loading...</div>
});

const ClientFadeIn = dynamic(() => import('@/components/client/ClientFadeIn').then(mod => ({ default: mod.ClientFadeIn })), {
  ssr: false,
  loading: () => <div className="opacity-0">Loading...</div>
});

const ClientHighlighter = dynamic(() => import('@/components/client/ClientHighlighter').then(mod => ({ default: mod.ClientHighlighter })), {
  ssr: false,
  loading: () => <div className="opacity-0">Loading...</div>
});

const CompanyLogo = dynamic(() => import('@/components/CompanyLogo'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-24 bg-neutral-50 animate-pulse rounded-md flex items-center justify-center">
      <div className="text-sm text-gray-500">Loading logos...</div>
    </div>
  )
});

// Component aliases for simpler usage
const ScrollReveal = ClientScrollReveal;
const FadeIn = ClientFadeIn;



export default async function Home() {
  // Fetch latest content server-side (ISR)
  const { news, events } = await getLatestContent();

  return (

    <div className="flex w-screen mx-auto max-w-[1080px] flex-col items-center justify-center gap-6 px-2 pt-20 mobile:pt-8 mobile:flex-col mobile:flex-nowrap mobile:gap-8 mobile:px-2 mobile:py-16">
      <div className="flex w-full flex-col items-center justify-end gap-6 mobile:px-2 mobile:py-2 relative">
        <div className="flex w-full max-w-[1280px] flex-col items-center gap-8 p-1 mobile:px-0 mobile:gap-5 mobile:py-0 relative z-10">
          <div className="flex w-full flex-col items-center gap-4 mobile:w-[92%]">
            {/* Hero Text - CSS-only fade-in with decoupled highlight animation */}
            <div 
              className="animate-[fadeInUp_0.8s_ease-out_forwards] opacity-0"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.2s forwards',
              }}
            >
              <h1 className="inline-block text-center w-full text-brand-900 mobile:text-hero-sm md:text-hero-md lg:text-hero lg:font-hero md:font-hero-md mobile:font-hero-sm mobile:text-left">
                <span className="relative inline-block">
                  Trusted Excellence
                  {/* CSS-only highlight underline */}
                  <span 
                    className="absolute left-0 w-full pointer-events-none mobile:hidden"
                    style={{
                      top: '70%',
                      height: '40%',
                      zIndex: -1,
                      animation: 'highlightDraw 0.8s ease-out 1.5s forwards'
                    }}
                  >
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 200 60"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 5 50 Q 100 20 195 50"
                        stroke="#50CEAA"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.85"
                        style={{
                          strokeDasharray: '400',
                          strokeDashoffset: '400',
                          filter: 'blur(0.5px) drop-shadow(0 0 4px #50CEAA30)',
                          animation: 'highlightPath 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) 1.2s forwards'
                        }}
                      />
                    </svg>
                  </span>
                </span> <span className="hidden md:inline"> in </span> <span className="inline-block"> <span className=" inline md:hidden"> in </span> Mission Critical Communications</span>
              </h1>
              <h6 className="mx-auto py-3 w-[80%] whitespace-pre-wrap mobile:text-body-xl-sm md:text-body-xl-md lg:text-body-xl text-center font-body-xl mobile:px-0 mobile:font-body-lg mobile:text-left mobile:w-[97%] mobile:leading-[1.5rem] text-subtext-color ">
                {"MCX ONE™ offers future-ready stack for mission critical success"}
              </h6>
            </div>

            {/* Hero Buttons - CSS-only fade-in for optimal performance */}
            <div 
              className="px-1 flex flex-wrap items-start gap-4 pt-2 mobile:px-0 opacity-0"
              style={{
                animation: 'fadeInUp 0.8s ease-out 1.0s forwards'
              }}
            >
              <Button3
                variant="destructive-primary"
                iconRight={<ArrowRight className="w-4 h-4" />}
              // onClick={(event: React.MouseEvent<HTMLButtonElement>) => { }}
              >
                Speak to Expert
              </Button3>
              <Button3
                variant="destructive-secondary"
                iconRight={<ArrowRight className="w-4 h-4" />}
              // onClick={(event: React.MouseEvent<HTMLButtonElement>) => { }}
              >
                Our Portfolio
              </Button3>
            </div>
          </div>

          {/* Hero Carousel - appears with elegant fadein after 1 second */}
          <StaticHeroCarousel />

          <div className="flex flex-wrap max-w-[90%] justify-center items-stretch gap-4 mobile:flex-col mobile:gap-2 md:w-full md:gap-y-6 md:px-2 md:py-6">
            {heroIndustries.map((industry, idx) => {
              // Validate icon URL to prevent construction errors
              const validIcon = industry.icon && (industry.icon.startsWith('http') || industry.icon.startsWith('/'))
                ? industry.icon
                : '/icons/Placeholder.png';

              return (
                <React.Fragment key={industry.name}>
                  {/* Vertical Divider */}
                  {idx > 0 && (
                    <div className="mobile:hidden h-6 my-auto flex flex-col items-center self-stretch bg-neutral-border w-[2px] flex-none" />

                  )}

                  {/* Industry Card */}
                  <div className="flex grow shrink flex-col items-center gap-4 px-4 py-4">
                    <div className="flex gap-5 mobile:flex-row md:flex-col md:items-start md:gap-5 lg:flex-row">
                      {/* Icon */}
                      <div className="flex items-center justify-center shrink-0">
                        <Image
                          src={validIcon}
                          alt={`${industry.name} icon`}
                          className="h-auto w-11 object-contain"
                          width={44}
                          height={44}
                          sizes="44px"
                        />
                      </div>

                      {/* Text */}
                      <div className="flex flex-col items-center justify-center">
                        <p className="w-full font-body-bold text-default-font mobile:text-body-bold-mobile md:text-body-bold-md lg:text-body-bold">
                          {industry.name}
                        </p>
                        <p className="w-full font-caption text-subtext-color mobile:text-caption-mobile md:text-caption-md lg:text-caption">
                          {industry.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>


          {/* Header 1 Open Standards appears with elegant fadein as soon as the user scrolls down */}
          <ScrollReveal className="flex lg:w-[85%] flex-col items-center justify-center gap-12 mobile:gap-6 mobile:w-[95%] mobile:px-2 mobile:py-8 md:py-16">
            <div className="flex w-full max-w-[960px] flex-col items-center justify-center gap-10">
              {/* Portfolio Header Image */}
              <div className="flex flex-col items-center justify-center md:gap-6 mobile:gap-3 px-4">
                <BadgeConsort
                  variant="warning">
                  About us</BadgeConsort>
                {/* <h2 className="mobile:text-heading-2-sm md:text-heading-2-md lg:text-heading-2 font-bold font-manrope  -tracking-[0.025rem] leading-[1.4em] text-center mobile:font-heading- mobile:text-center">
                  Open, Smart & Flexible
                </h2> */}
                <h2 className="!leading-snug text-consort-blue !-tracking-[0.03rem] mobile:text-xl md:text-2xl lg:text-4xl font-semibold font-manrope -tracking-[0.025rem] leading-[1.4em] text-center mobile:font-heading- mobile:text-center">
                  {/* <span className="bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent">
                  MCX ONE™ by Consort </span> */}
                  MCX ONE™ by Consort is built on open global standards with
                  flexible deployment on Edge, On-prem & Cloud
                </h2>

                {/* <h2 className="text-2xl font-semibold text-neutral-600 -tracking-[0.025rem] font-heading-1 text-center !leading-[1.4em] mobile:text-heading-3 mobile:font-heading-3 mobile:text-center">
                  <span className="!font-bold inline-block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Open Standards | Vendor Agnostic | Supports Edge Intellligence</span>
                </h2> */}
              </div>
              <Image
                className="w-full max-w-[576px] mobile:max-w-[320px] h-auto"
                src="/about.webp"
                alt="MCX ONE architecture diagram"
                width={576}
                height={320}
                priority
                sizes="(max-width: 768px) 100vw, 576px"
                quality={90}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."
              />


              {/* Hero Stats appears with elegant fadein as soon as the user scrolls down */}
              <div className="flex w-[90%] flex-wrap items-start justify-center gap-4 bg-brand-50 rounded-md px-6 py-6 mobile:flex-wrap mobile:items-start mobile:justify-center">
                {heroStats.map((stat, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex basis-0 grow shrink-0 flex-col items-center gap-1 mobile:min-w-[96px]">
                      <h5 className="text-center text-consort-blue font-heading-3 lg:text-heading-2 md:text-heading-2-md mobile:text-heading-2-sm mobile:font-body-xl-bold">
                        {stat.countX}
                      </h5>
                      <p className="text-center !leading-tight text-subtext-color !whitespace-pre-wrap font-body lg:text-body-lg md:text-body-md mobile:text-body-mobile">
                        {stat.label}
                      </p>
                    </div>
                    {/* Divider except after the last item */}
                    {idx !== heroStats.length - 1 && (
                      <div className="mobile:hidden h-10 my-auto flex flex-col items-center self-stretch bg-neutral-border w-[2px] flex-none" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </ScrollReveal>



          {/* Our Clients Section appears with elegant fadein as soon as the user scrolls down */}
          <ScrollReveal className="flex w-[95%] flex-col items-center justify-center md:gap-12 mobile:gap-6 py-16">
            <div className="flex flex-col items-center justify-center gap-4">

              <h2 className="bg-gradient-to-r from-amber-600 to-red-700 bg-clip-text !font-extrabold text-transparent mobile:text-heading-2-sm md:text-heading-2-md lg:text-heading-2 font-heading-2 text-center mobile:font-heading-3 mobile:font-bold">
                #TrustYourResponse
              </h2>
              <h4 className=" mobile:text-body-xl-sm md:text-body-xl-md lg:text-body-xl text-center font-body-xl mobile:px-0 mobile:font-body-lg mobile:w-[97%] mobile:leading-[1.5rem] text-subtext-color ">
                {"20+ Years of uncompromising reliability"}
              </h4>
            </div>
            <CompanyLogo />
            {/* <div className="flex flex-col items-center justify-center gap-4">
        </div> */}
            <div className="flex flex-col max-w-[768px] rounded-md  px-4 py-6 items-center justify-center gap-4">

              <h5 className="mobile:text-body-bold-mobile md:text-body-bold-md lg:text-body-bold font-heading-2 text-red-700 text-center">
                Our Latest Case Studies
              </h5>
              <div className="flex items-start flex-wrap  justify-center gap-3 px-1 py-1 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
                {[
                  { name: "Tata Steels", href: "/" },
                  { name: "Mumbai Metro Line 7A", href: "/" },
                  
                  { name: "Noida Int'l Airport", href: "/" },
                  { name: "Lucknow Int'l Airport", href: "/" },
                ].map((study) => (
                  <Link key={study.name} href={study.href}>
                    <Button3
                      variant="neutral-secondary"
                      iconRight={<ArrowRight className="w-4 h-4" />}
                    >
                      {study.name}
                    </Button3>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Our Portfolio Section appears with elegant fadein as soon as the user scrolls down */}
          <ScrollReveal
            className="full-width-bg lg:py-20 bg-neutral-100 flex w-full flex-col items-center justify-center gap-6 mobile:px-4 mobile:py-4 md:py-12"
          >
            <div className="flex flex-col items-center justify-center gap-6 py-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <BadgeConsort
                  variant="warning">
                  Our Portfolio</BadgeConsort>
                <h2 className="text-consort-blue mobile:text-heading-2-sm md:text-heading-2-md lg:text-heading-2 font-heading-2 text-center mobile:font-heading-3 mobile:font-bold">
                  Discover Our Portfolio
                </h2>
                <h4 className="mobile:text-body-xl-sm md:text-body-xl-md lg:text-body-xl text-center font-body-xl mobile:px-0 mobile:font-body-lg mobile:w-[97%] mobile:leading-[1.5rem] text-subtext-color ">
                  {"MCX ONE™ is future-ready stack for mission critical success"}
                </h4>
                {/* Hero Buttons */}

              </div>
            </div>
            <div className="flex w-full max-w-[860px] flex-col items-start gap-16">
              <div className="grid w-full gap-3 md:grid-cols-3 sm:grid-cols-1 mobile:gap-4">
                {[
                  {
                    count: "MCX ONE™ Platform",
                    desc: "Open Standards, Vendor Agnostic, Scalable Platform for Mission Critical Voice, Data, & Video for Edge, Cloud, & On-Prem deployment",
                    image: "/m1logo-dark.svg",
                    url: "/portfolio?tab=platform"
                  },
                  {
                    count: "Devices",
                    desc: "Rugged, MCX-ready devices for field & control room use",
                    image: "/devices-red.svg",
                    url: "/portfolio?tab=devices"
                  },
                  {
                    count: "Apps & SDKs",
                    desc: "Intuitive apps and developer tools for seamless MCX integration",
                    image: "/sdk-red.svg",
                    url: "/portfolio?tab=appssdk"
                  },
                  {
                    count: "Extensions",
                    desc: "Industry-specific modules tailored for critical operational needs",
                    image: "/extensions-red.svg",
                    url: "/portfolio?tab=extensions"
                  },
                  {
                    count: "Network",
                    desc: "Secure, high-availability LTE 4G, 5G & TETRA network solutions",
                    image: "/network-red.svg",
                    url: "/portfolio?tab=networks"
                  },
                ].map(({ count, desc, image, url }, idx) => (
                  <ScrollReveal
                    key={idx}
                    delay={idx * 0.15}
                    duration={0.8}
                    blurAmount={6}
                    className={idx === 0 ? 'lg:col-span-2 md:col-span-2' : ''}
                  >
                    <Link href={url} className="block">
                      <div
                        className={`
                        relative group flex shadow rounded-md bg-white hover:shadow-md
                        md:h-72 md:gap-2 md:flex-col md:items-start md:px-8 md:pt-8 md:pb-8
                        mobile:h-auto mobile:flex-col mobile:w-full mobile:items-start mobile:justify-start mobile:gap-2 mobile:px-6 mobile:py-8
                        cursor-pointer transition-all duration-300 hover:shadow-lg
                      `}
                      >
                        {/* Top-right Icon */}
                        <ArrowUpRight
                          className="absolute top-4 right-4 w-8 h-8 text-neutral-400 transition-transform duration-300 ease-out group-hover:text-consort-red group-hover:translate-x-1 group-hover:-translate-y-1"
                        />

                        {/* Main Content */}
                        <Image
                          className="object-contain flex-none mobile:mb-4 group-hover:grayscale-0 mb-auto"
                          src={image}
                          alt={`${count} icon`}
                          loading={idx < 2 ? "eager" : "lazy"}
                          width={idx === 0 ? 90 : 60}
                          height={idx === 0 ? 60 : 40} // adjust height if needed
                        />
                        <span className="mobile:text-heading-4-sm md:text-heading-4-md lg:text-heading-4 font-heading-1 text-consort-blue text-inverse-font group-hover:text-consort-red !cursor-pointer transition-all duration-200">
                          {count}
                        </span>
                        <span className="mobile:text-body-mobile md:text-body-md lg:text-body font-body leading-tight tracking-tight text-neutral-500 whitespace-pre-line group-hover:text-consort-red transition-all duration-200">
                          {desc}
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>

            </div>
            <ScrollReveal delay={0.1} duration={1.0} blurAmount={10}>
              <div className="px-1 flex flex-wrap justify-center gap-4 pt-2 mobile:px-0">
                <Button3
                  variant="destructive-primary"
                  iconRight={<ArrowRight className="w-4 h-4" />}
                // onClick={(event: React.MouseEvent<HTMLButtonElement>) => { }}
                >
                  Speak to Expert
                </Button3>
                <Button3
                  variant="destructive-secondary"
                  iconRight={<ArrowRight className="w-4 h-4" />}
                // onClick={(event: React.MouseEvent<HTMLButtonElement>) => { }}
                >
                  View All Products
                </Button3>
              </div>
            </ScrollReveal>
            {/* Portfolio Stack appears with elegant fadein as soon as the user scrolls down */}
            {/* <ScrollReveal className="w-full my-24">
              <PortfolioStack />
            </ScrollReveal> */}

          </ScrollReveal>
          <ScrollReveal className="w-full my-24">
            {/* Our Industry Focus Section appears with elegant fadein as soon as the user scrolls down */}
            <div className="text-center md:mb-12 mobile:mb-2">
              <h2 className="text-consort-blue mobile:text-heading-2-sm md:text-heading-2-md lg:text-heading-2 font-heading-2">
                Our Industry Focus
              </h2>
              <p className="font-body mobile:text-body-xl-sm md:text-body-xl-md lg:text-body-xl text-subtext-color mt-4 max-w-3xl mx-auto">
                Delivering specialized communication solutions
              </p>
            </div>

            {/* Industry Focus Section appears with elegant fadein as soon as the user scrolls down */}
            <ScrollReveal delay={0.1} duration={1.0} blurAmount={10} className="w-full mt-24 mobile:mt-12">
              <IndustryFocus />
            </ScrollReveal>
          </ScrollReveal>
          <ScrollReveal delay={0.1} duration={1.0} blurAmount={10} className="w-full mb-24 mobile:hidden">
            {/* Our Industry Focus Section appears with elegant fadein as soon as the user scrolls down */}
            <div className="text-center mb-12">
              {/* <h2 className="text-consort-blue mobile:text-heading-2-sm md:text-heading-2-md lg:text-heading-2 font-heading-2">
                Our Industry Focus
              </h2> */}
              <p className="font-body mobile:text-body-xl-sm md:text-body-xl-md lg:text-body-xl text-subtext-color mt-4 max-w-3xl mx-auto">
                Delivering specialized communication solutions
              </p>
            </div>
            <InteractiveIndustrySection />

          </ScrollReveal>

          {/* End of Hero Stats */}
          {/* <div className="flex w-full items-center justify-center pt-8">
            <CompanyLogo />
          </div> */}

          {/* Header 1 Open Standards */}
          <ScrollReveal className="flex w-full max-w-[1280px] flex-col items-center justify-center gap-12 mobile:gap-6 py-16">
            <div className="flex flex-col items-center justify-center gap-10">
              <div className="flex flex-col items-center justify-center gap-4">
                <BadgeConsort
                  variant="warning">
                  Unlock Benefits with MCX ONE™</BadgeConsort>
                <h2 className="text-consort-blue mobile:text-heading-2-sm md:text-heading-2-md lg:text-heading-2 font-heading-2 text-center mobile:font-heading-3 mobile:font-bold">
                  Why Choose MCX ONE™?
                </h2>
                <h4 className="mobile:text-body-xl-sm md:text-body-xl-md lg:text-body-xl text-center font-body-xl mobile:px-0 mobile:font-body-lg mobile:w-[97%] mobile:leading-[1.5rem] text-subtext-color ">
                  {"Truly Flexible, Smart, Scalable Architecture offering Multi-Tech Stack"}
                </h4>
                {/* Hero Buttons */}
                <FadeIn>
                  <div className="px-1 flex flex-wrap justify-center gap-4 pt-2 mobile:px-0">
                    <Button3
                      variant="destructive-primary"
                      iconRight={<ArrowRight className="w-4 h-4" />}
                    // onClick={(event: React.MouseEvent<HTMLButtonElement>) => { }}
                    >
                      Speak to Expert
                    </Button3>
                    <Button3
                      variant="destructive-secondary"
                      iconRight={<ArrowRight className="w-4 h-4" />}
                    // onClick={(event: React.MouseEvent<HTMLButtonElement>) => { }}
                    >
                      About MCX ONE™
                    </Button3>
                  </div>
                </FadeIn>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex w-full flex-wrap items-stretch gap-3 mobile:flex-col">
                <ScrollReveal
                  delay={0.1}
                  duration={1.0}
                  blurAmount={10}
                  className="flex grow shrink-0 basis-0 flex-col items-start gap-6 rounded-md bg-gradient-to-br from-[#09286d] to-[#334182] px-8 py-8 mobile:px-6 mobile:py-6"
                >

                  <div className="flex w-full flex-col items-start gap-2 px-1 py-1">
                    <h3 className="lg:text-body-xl md:text-body-xl-md mobile:text-body-xl-sm !font-bold font-body-xl text-white">
                      Truly Flexible ✅
                    </h3>
                    <p className="lg:text-body md:text-body-md mobile:text-body-sm font-body text-default-font !font-light text-neutral-300">
                      MCX ONE™ is a future-ready platform that bridges broadband & legacy networks,
                      scales from edge to cloud, while integrating voice, video, & data to serve
                      mission-critical industries — all from a single platform
                    </p>
                  </div>
                  <Image
                    className="flex-none w-full my-6"
                    src="/mcxonel.svg"
                    alt="MCX ONE Flexible Architecture"
                    width={300}
                    height={150}
                  />
                </ScrollReveal>
                <ScrollReveal
                  delay={0.3}
                  duration={1.2}
                  blurAmount={12}
                  className="flex grow shrink-0 basis-0 flex-col items-start gap-6 rounded-md bg-gradient-to-tl from-[#09286d] to-[#334182] px-8 py-8 mobile:px-6 mobile:py-6 !shadow-md"
                >

                  <div className="flex w-full flex-col items-start gap-2 px-1 py-1">
                    <h3 className="lg:text-body-xl md:text-body-xl-md mobile:text-body-xl-sm !font-bold font-body-xl text-white">
                      Smart Architecture ✅
                    </h3>
                    <p className="lg:text-body md:text-body-md mobile:text-body-sm font-body text-default-font !font-light text-neutral-300">
                      MCX ONE™ supports multi-tenant deployments, edge intelligence,
                      & enables seamless updates - delivering performance, availability, along with agility in
                      every critical communication environment.


                    </p>
                  </div>
                  <Image
                    className="flex-none w-full my-6"
                    src="/mcxoner.svg"
                    alt="MCX ONE Smart Architecture"
                    width={300}
                    height={150}
                  />
                </ScrollReveal>
              </div>

              <ScrollReveal
                delay={0.1}
                duration={1.0}
                blurAmount={10}
                className="flex flex-col w-[100%] items-start gap-12 rounded-md bg-gradient-to-t from-[#09286d] to-[#334182] px-12 py-12 mobile:px-8 mobile:py-8 mobile:gap-2 !shadow-md">
                <div className="flex flex-col items-start gap-2 max-w-[640px]">
                  <h2 className="lg:text-body-xl md:text-body-xl-md mobile:text-body-xl-sm !font-bold font-body-xl text-white">
                    <span className="text-yellow-300">The Right Step</span> to Modernize your Critical Systems
                  </h2>
                  <p className="lg:text-body md:text-body-md mobile:text-body-sm mobile:mb-4 font-body text-default-font text-gray-300">
                    No Lock-Ins. No Overheads. Just Control.
                  </p>
                </div>
                <div className="grid w-full gap-y-16 gap-x-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mobile:gap-y-8 mobile:gap-x-2">
                  {[
                    {
                      icon: "/verified.png",
                      title: "ETSI 3GPP Complaint",
                      description: "Globally Proven Industry leading Open Standards",
                    },
                    {
                      icon: "/layer.png",
                      title: "User Friendly Apps",
                      description: "Effortless Communication \n& Intuitive Experience",
                    },
                    {
                      icon: "/hourglass.png",
                      title: "Real-time monitoring",
                      description: "Stay ahead with Instant Insights from your resources",
                    },
                    {
                      icon: "/protection.png",
                      title: "Secured & Fault Tolerant",
                      description: "Reliability You Can Trust & Security You Can Rely On",
                    },
                  ].map(({ icon, title, description }, idx) => (
                    <div
                      key={idx}
                      className={`
                          flex flex-col items-start gap-6 text-center
                           ${idx === 3 ? 'lg:col-span-1 lg:row-span-1' : ''}
              
                        `}>
                      <Image className="h-8 object-contain filter invert" src={icon} alt={title} width={32} height={32} />
                      <div className="flex flex-col items-start gap-1">
                        <h3 className="font-body-xl text-neutral-50 mobile:text-body-lg-sm md:text-body-lg-md lg:text-body-lg !font-bold !leading-tight text-left">
                          {title}
                        </h3>
                        <p className="lg:text-body md:text-body-md mobile:text-body-sm font-body whitespace-pre-line text-default-font text-gray-400 text-left">
                          {description}
                        </p>

                      </div>
                    </div>
                  ))}
                </div>


              </ScrollReveal>
            </div>


          </ScrollReveal>


          <div>

          </div>

        </div>
      </div>



      {/* Blogs Section appears with elegant fadein as soon as the user scrolls down */}

      <ScrollReveal className="full-width-bg py-24 flex w-full flex-col items-center justify-center gap-12 mobile:px-4 mobile:py-4 bg-gradient-to-b from-brand-50 via-neutral-100 to-white">

        <div className="flex flex-col items-center justify-center gap-4">
          <BadgeConsort
            variant="warning">
            News, Events & Announcements</BadgeConsort>
          <h2 className="text-consort-blue mobile:text-heading-2-sm md:text-heading-2-md lg:text-heading-2 font-heading-2 text-center mobile:font-heading-3 mobile:font-bold">
            Latest Updates from Consort
          </h2>
          {/* <h4 className="mobile:text-body-xl-sm md:text-body-xl-md lg:text-body-xl text-center font-body-xl mobile:px-0 mobile:font-body-lg mobile:w-[97%] mobile:leading-[1.5rem] text-subtext-color ">
            {"MCX ONE™ is future-ready stack for mission critical success"}
          </h4> */}
        </div>

        {/* Latest News Section */}
        {news.length > 0 && (
          <div className="w-full max-w-6xl mx-auto mobile:px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-consort-blue">Latest News</h3>
              <Link href="/posts/news">
                <Button3
                  variant="neutral-secondary"
                  size="small"
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  View All News
                </Button3>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item, idx) => {
                const cardData = mapPostToCard(item, 'news');
                return (
                  <ContentCard1
                    key={`news-${item.id}`}
                    image={cardData.image}
                    title={cardData.title}
                    date={cardData.date}
                    url={cardData.url}
                    tags={cardData.tags}
                    type={cardData.type}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Latest Events Section */}
        {events.length > 0 && (
          <div className="w-full max-w-6xl mx-auto mobile:px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-consort-blue">Latest Events</h3>
              <Link href="/posts/events">
                <Button3
                  variant="neutral-secondary"
                  size="small"
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  View All Events
                </Button3>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((item, idx) => {
                const cardData = mapPostToCard(item, 'events');
                return (
                  <ContentCard1
                    key={`events-${item.id}`}
                    image={cardData.image}
                    title={cardData.title}
                    date={cardData.date}
                    url={cardData.url}
                    tags={cardData.tags}
                    type={cardData.type}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback when no content available */}
        {news.length === 0 && events.length === 0 && (
          <div className="w-full max-w-6xl mx-auto mobile:px-4 text-center py-8">
            <p className="text-neutral-500">Latest content will appear here once posts are published.</p>
          </div>
        )}

      </ScrollReveal>





    </div>
  );
}
