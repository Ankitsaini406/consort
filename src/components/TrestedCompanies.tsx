import Image from "next/image";

interface ProductProps {
    compenies: {
        logos: string[];
    };
}

export default function TrestedCompanies({ compenies }: ProductProps) {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md bg-neutral-50 px-12 pt-6 pb-9 my-5">
            <span className="w-full text-body-lg font-body-lg text-default-font text-center -tracking-[0.035em]">
                Trusted by top companies
            </span>
            <div className="flex w-full flex-wrap items-center justify-center gap-12 mobile:items-center mobile:justify-start">
                {compenies.logos.map((logo, index) => (
                    <Image
                        key={index}
                        alt="Company logo"
                        className="h-12 w-fit flex-none object-cover grayscale opacity-50"
                        src={logo}
                        width={50}
                        height={48}
                    />
                ))}
            </div>
        </div>
    );
}
