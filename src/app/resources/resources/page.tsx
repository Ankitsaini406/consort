import CaseStudiesSection from "@/components/CaseStudySection";
import Questions from "@/components/CommonCTA";
import RelatedProducts from '@/components/related/RelatedLayout';
import TrestedCompanies from "@/components/TrestedCompanies";
import { Button3 } from "@/ui/components/Button3";
import { BadgeConsort } from "@/ui/components/BadgeConsort";
import { FeatherCheckSquare, FeatherShare } from "@subframe/core";
import Image from "next/image";

const resourceData = {
    "title": "LTE Train Radio System for Metro Rail",
    "description": "From group & individual calls to emergency and broadcast calls, RCP 5210A ensures reliability, security, and operational efficiency.",
    "image": "https://res.cloudinary.com/subframe/image/upload/v1747756912/uploads/12970/sfmokcbeuk8r2ljvfzh2.avif",
    "badges": [
        { "label": "Mass Transit" },
        { "label": "Handheld" },
        { "label": "TETRA" },
        { "label": "DMR" }
    ],
    "blogContent": [
        {
            "title": "Our Solution",
            "image": "https://res.cloudinary.com/subframe/image/upload/v1747902182/uploads/12970/hfhiuuw7xo0mp1nojstx.webp",
            "heading": "As the needs of the railways and mass transit systems are constantly evolving, and on the other side the telecom standards evolution remains dependent of the telecom industry evolution cycles, with an gradual end of support for GSM-R. These considerations led International Union of Railways (UIC) , as soon as 2012, to launch the first studies for a successor to GSM-R, pertinently named Future Rail Mobile Communications System (FRMCS).",
            "description": "The UIC Project then concretely delivered the new User Requirements Specifications (URS) focusing mainly on rail communication needs- as a basis for the development of the GSM-R successor. ETSI 3GPP has been developing LTE as an open standard technology to replace GSM-R. The key requirements are : Single bearer for both Voice and Data The teams focused their efforts on a few of the highest-value S&OP levers in order to review the current planning process, identify gaps in the planning infrastructure and analytically understand demand and supply variability. Enhanced data requirement for modern signalling systems With hundreds of medications in the market, Pharm Ltd. needed a proper method to predict and manage their inventory. Using a mean absolute percentage analysis (MAPE), the teams defined appropriate levels for raw materials and finished products by mapping actual versus forecasted sales on the most important SKUs. Next gen applications for passenger safety and convenience Modern communication system must support the need for next generation application for train operations and passengers. Safe, secure and high availability Modern communication system must support the need for next generation application for train operations and passengers. Interoperable and multi-vendor support The proposed solution must be fully interoperable and be standardized for multi-vendor environment.",
            "bulletPoints": [
                "10.4\" PCAP Multitouch Touch Screen with Anti Glare GORILLA Glass Screen with Anti Glare GORILLA Glass",
                "PCAP Multitouch Touch Screen Anti Glare GORILLA Glass",
                "6-key illuminated touch keypad",
                "Stereo Vision IR Camera for night vision",
                "10.4\" PCAP Multitouch Touch Screen with Anti Glare GORILLA Glass Screen with Anti Glare GORILLA Glass"
            ],
        },
        {
            "title": "Our Solution",
            // "image": "https://res.cloudinary.com/subframe/image/upload/v1747902182/uploads/12970/hfhiuuw7xo0mp1nojstx.webp",
            "heading": "As the needs of the railways and mass transit systems are constantly evolving, and on the other side the telecom standards evolution remains dependent of the telecom industry evolution cycles, with an gradual end of support for GSM-R. These considerations led International Union of Railways (UIC) , as soon as 2012, to launch the first studies for a successor to GSM-R, pertinently named Future Rail Mobile Communications System (FRMCS).",
            "description": "The UIC Project then concretely delivered the new User Requirements Specifications (URS) focusing mainly on rail communication needs- as a basis for the development of the GSM-R successor. ETSI 3GPP has been developing LTE as an open standard technology to replace GSM-R. The key requirements are : Single bearer for both Voice and Data The teams focused their efforts on a few of the highest-value S&OP levers in order to review the current planning process, identify gaps in the planning infrastructure and analytically understand demand and supply variability. Enhanced data requirement for modern signalling systems With hundreds of medications in the market, Pharm Ltd. needed a proper method to predict and manage their inventory. Using a mean absolute percentage analysis (MAPE), the teams defined appropriate levels for raw materials and finished products by mapping actual versus forecasted sales on the most important SKUs. Next gen applications for passenger safety and convenience Modern communication system must support the need for next generation application for train operations and passengers. Safe, secure and high availability Modern communication system must support the need for next generation application for train operations and passengers. Interoperable and multi-vendor support The proposed solution must be fully interoperable and be standardized for multi-vendor environment.",
            "bulletPoints": [
                "10.4\" PCAP Multitouch Touch Screen with Anti Glare GORILLA Glass Screen with Anti Glare GORILLA Glass",
                "PCAP Multitouch Touch Screen Anti Glare GORILLA Glass",
                "6-key illuminated touch keypad",
                "Stereo Vision IR Camera for night vision",
                "10.4\" PCAP Multitouch Touch Screen with Anti Glare GORILLA Glass Screen with Anti Glare GORILLA Glass"
            ],
        },
    ],
    logos: [
        "https://res.cloudinary.com/subframe/image/upload/v1747834320/uploads/12970/vsiy1svi5tcxtsrpb4az.webp",
        "https://res.cloudinary.com/subframe/image/upload/v1747834332/uploads/12970/qqukm0jygiuxskrnikcc.webp",
        "https://res.cloudinary.com/subframe/image/upload/v1747834347/uploads/12970/uoglrhb5u7icevwz2ure.webp",
        "https://res.cloudinary.com/subframe/image/upload/v1747834423/uploads/12970/lpfhruo0uwu2o1hperfn.jpg",
        "https://res.cloudinary.com/subframe/image/upload/v1747834407/uploads/12970/acsd4lusn8fcxxts5whm.webp",
        "https://res.cloudinary.com/subframe/image/upload/v1747834391/uploads/12970/vkmqgxc5ys424awozrwk.png"
    ],
    relatedProducts: {
        items: [
            {
                image: "https://res.cloudinary.com/subframe/image/upload/v1747848342/uploads/12970/u0tk28pkkpioi7q93ttq.webp",
                title: "RCP 5310A",
                description: "Professional DMR Portable Radio for 2-way Comms",
                url: "/products/rcp-5310a"
            },
            {
                image: "https://res.cloudinary.com/subframe/image/upload/v1747848354/uploads/12970/vtcfr9rxn4fvrwchhmsq.webp",
                title: "RCP 5310A Radio Tetra Solution",
                description: "RCP 5310A",
                url: "/products/rcp-5310a-tetra"
            },
            {
                image: "https://res.cloudinary.com/subframe/image/upload/v1747848368/uploads/12970/j2n6x1mwljgoky9no6er.webp",
                title: "RCP 5310A Radio Tetra Solution",
                description: "RCP 5310A",
                url: "/products/rcp-5310a-tetra-2"
            },
            {
                image: "https://res.cloudinary.com/subframe/image/upload/v1747848379/uploads/12970/d7hchtknll92t5rw7xzv.webp",
                title: "RCP 5310A Radio Tetra Solution",
                description: "RCP 5310A",
                url: "/products/rcp-5310a-tetra-3"
            }
        ]
    },
    caseStudies: {
        items: [
            {
                image: "https://res.cloudinary.com/subframe/image/upload/v1747756912/uploads/12970/sfmokcbeuk8r2ljvfzh2.avif",
                title: "TETRA Radio Use in Metro Trains in India",
                description: "Case Study from India's busiest Metro Route demonstrates the agility of TETRA",
                url: "/case-studies/tetra-metro-india"
            },
            {
                image: "https://res.cloudinary.com/subframe/image/upload/v1747759080/uploads/12970/ungklbj1eovabr3qlpuq.avif",
                title: "Mobile Radio now used in Multiple Metro Trains",
                description: "Case Study from India's busiest agility of TETRA",
                url: "/case-studies/mobile-radio-metro"
            },
            {
                image: "https://res.cloudinary.com/subframe/image/upload/v1747848163/uploads/12970/ejamcjl6w1pulyubod5y.avif",
                title: "Mobile Radio Preferred Solution for Mass Transit",
                description: "Case Study from India's busiest Metro Route demonstrates the agility of TETRA",
                url: "/case-studies/mobile-radio-mass-transit"
            }
        ],
    },
};

export default function Page() {
    return (
        <div className="flex w-full max-w-[1024px] mx-auto flex-col items-start gap-6 rounded-md px-6 py-6 mobile:border mobile:border-solid mobile:border-neutral-border mobile:bg-transparent mobile:px-0 mobile:pt-0 mobile:pb-4">
            <div className="flex w-full flex-col items-start gap-2 px-1 pt-16 mobile:px-1 mobile:pt-16 mobile:pb-1">
                <div className="flex w-full flex-col items-start justify-center gap-4">
                    <div className="flex w-full items-center justify-between mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-6">
                        <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-2 px-1 py-1">
                            {resourceData.badges.map((badge, index) => (
                                <BadgeConsort
                                    key={index}
                                    className="h-7 w-auto flex-none"
                                    variant="neutral"
                                    // icon={badge.icon ? iconMap[badge.icon] : undefined}
                                    iconRight={null}
                                >
                                    {badge.label}
                                </BadgeConsort>
                            ))}
                        </div>
                        <Button3
                            variant="destructive-tertiary"
                            size="small"
                            icon={<FeatherShare />}
                        // onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                        >
                            Share
                        </Button3>
                    </div>
                </div>
                <span className="w-full max-w-[768px] text-heading-2 font-heading-2 text-consort-blue ml-1.5 mobile:text-heading-3 mobile:font-heading-3">
                    {resourceData.title}
                </span>
                <span className="max-w-[768px] text-body-lg font-body-lg text-subtext-color ml-1.5">
                    {resourceData.description}
                </span>
                {/* <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border mt-1 mb-1.5" /> */}
                <Image
                    width={1000}
                    height={1000}
                    alt="LTE Train Radio System for Metro Rail"
                    className="max-h-[320px] w-full grow shrink-0 basis-0 rounded-md object-cover mt-4"
                    src="https://res.cloudinary.com/subframe/image/upload/v1747756912/uploads/12970/sfmokcbeuk8r2ljvfzh2.avif"
                />
            </div>



            {/* Content Section */}
            <div className="flex flex-col gap-12">
                {resourceData.blogContent.map((point, index) => (
                    <div
                        key={index}
                        className={`flex w-full items-start gap-6
                            } px-12 py-12 mobile:flex-col mobile:flex-nowrap mobile:gap-6 mobile:px-6 mobile:py-6`}
                    >
                        {/* Left Sidebar Title */}
                        <div className="flex w-60 flex-none items-start gap-6 lg:sticky top-0 md:static">
                            <span className="text-heading-3 font-heading-3 text-consort-blue">
                                {point.title}
                            </span>
                        </div>

                        {/* Content Area */}
                        {point.title === 'Our Solution' ? (
                            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                                {/* Image Box */}
                                {point.image && <div className="flex max-h-[768px] w-full flex-col items-start gap-2 overflow-hidden rounded-md bg-white px-4 py-4 shadow-sm">
                                    <Image
                                        width={1000}
                                        height={1000}
                                        className="w-full grow shrink-0 basis-0 object-contain"
                                        src={point.image || ''}
                                        alt={point.title}
                                    />
                                </div>}
                                {/* Heading and Description */}
                                {point.heading && <span className="text-body-lg font-body-lg text-consort-blue">
                                    {point.heading}
                                </span>}
                                {point.description && <span className="text-body font-body text-subtext-color">
                                    {point.description}
                                </span>}
                                {point.bulletPoints && <div className="flex flex-col items-start gap-4 px-2">
                                    {point.bulletPoints.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <FeatherCheckSquare className="text-body-lg font-body-lg text-consort-red mt-1" />
                                            <span className="text-body font-body text-consort-blue">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>}
                            </div>
                        ) : (
                            <span className="text-body font-body text-subtext-color">
                                {point.description}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Trusted Companies */}
            <TrestedCompanies compenies={{ logos: resourceData.logos }} />

            {/* Related Products */}
            <RelatedProducts items={resourceData.relatedProducts.items} />

            {/* Case Studies */}
            <CaseStudiesSection items={resourceData.caseStudies.items} />

            {/* Question */}
            <Questions />
        </div>
    )
}