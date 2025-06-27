import Image from 'next/image';

interface Industry {
    slug: string;
    industryName: string;
    industryIconUrl: string;
}

interface ServerTargetIndustriesProps {
    industries: Industry[];
}

export default function ServerTargetIndustries({ industries }: ServerTargetIndustriesProps) {
    if (!industries || industries.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-6 justify-center items-center">
            {industries.map((industry, index) => (
                <div key={`industry-${industry.slug || industry.industryName || index}`} className="flex flex-col items-center justify-between self-stretch">
                    {industry.industryIconUrl && (
                        <Image
                            alt={industry.industryName}
                            className="max-h-[40px] w-11 flex-none mobile:h-auto mobile:max-h-[36px] mobile:w-full mobile:max-w-[36px] mobile:flex-none"
                            src={industry.industryIconUrl}
                            width={44}
                            height={40}
                            priority // Preload these critical images
                        />
                    )}
                    <p className="text-caption-bold font-caption-bold text-consort-blue mt-2">
                        {industry.industryName}
                    </p>
                </div>
            ))}
        </div>
    );
} 