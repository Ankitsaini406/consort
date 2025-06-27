'use client';

import { FeatherShare } from "@subframe/core";
import { Button3 } from "@/ui/components/Button3";
import { toast } from "sonner";

export default function ShareButton() {
    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";

        if (!url) {
            toast.error("Unable to get current URL");
            return;
        }

        // Web Share API (mobile)
        if (navigator.share) {
            try {
                await navigator.share({ title: document.title, url });
                return;
            } catch (err) {
                console.error("Share failed:", err);
            }
        }

        // Clipboard fallback
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link");
            console.error("Copy failed:", err);
        }
    };

    return (
        <Button3
            onClick={handleShare}
            variant="destructive-tertiary"
            size="small"
            icon={<FeatherShare />}
        >
            Share
        </Button3>
    );
}
