'use client';

import { FeatherMap, FeatherBookOpen, FeatherFileText, FeatherFile } from "@subframe/core";
import { Button3 } from "@/ui/components/Button3";

type PDFButtonProps = {
    url: string;
};

export default function PDFButton({ url }: PDFButtonProps) {
    let title = "PDF";
    let icon = <FeatherFile />;

    if (url.includes("brochure")) {
        title = "Brochure";
        icon = <FeatherMap />;
    } else if (url.includes("caseStudy")) {
        title = "Case Study";
        icon = <FeatherBookOpen />;
    } else if (url.includes("datasheet")) {
        title = "Datasheet";
        icon = <FeatherFileText />;
    }

    return (
        <Button3
            onClick={() => window.open(url, "_blank")}
            disabled={!url}
            variant="brand-secondary"
            size="medium"
            icon={icon}
        >
            {title}
        </Button3>
    );
}
