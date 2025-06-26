"use client";

import HeaderWrapper from "@/components/layout/HeaderWrapper";
import { usePathname } from "next/navigation";
import { Toaster } from "@subframe/core";
import Footer from "@/components/layout/Footer";
import { UserProvider } from "@/context/userContext";
import { TagProvider } from "@/context/TagContext";
// import Template from "./template";

export default function ChildLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const noHeaderFooterRoutes = ["/admin", "/auth", "/auth/forgot-password"];
    const isAdminRoute =
        noHeaderFooterRoutes.some(route => pathname === route) ||
        pathname.startsWith("/admin/") ||
        pathname.startsWith("/auth/");

    // Routes where CommonCTA should be hidden
    const shouldHideCommonCTA = pathname === "/contact-us" || pathname === "/contact-us/";
    

    return (
        <UserProvider>
            <TagProvider>
                <div className="flex min-h-screen flex-col">
                    {!isAdminRoute && <HeaderWrapper />}
                    <main className="flex-1">{children}</main>
                    {!isAdminRoute && <Footer hideCommonCTA={shouldHideCommonCTA} />}
                    <Toaster position="top-right" richColors />
                </div>
            </TagProvider>
        </UserProvider>
    );
}