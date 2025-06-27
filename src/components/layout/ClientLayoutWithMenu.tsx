"use client";

import HeaderWrapper from "./HeaderWrapper";
import { usePathname } from "next/navigation";
import { Toaster } from "@subframe/core";
import Footer from "./Footer";
import { UserProvider } from "@/context/userContext";
import { TagProvider } from "@/context/TagContext";
import { MenuItem } from "./Header";

interface ClientLayoutWithMenuProps {
  children: React.ReactNode;
  menu: MenuItem[];
}

/**
 * Client component that receives build-time generated menu and renders layout
 * This maintains the client-side routing and state while using server-generated menu
 */
export default function ClientLayoutWithMenu({ children, menu }: ClientLayoutWithMenuProps) {
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
                    {!isAdminRoute && <HeaderWrapper menu={menu} />}
                    <main className="flex-1">{children}</main>
                    {!isAdminRoute && <Footer hideCommonCTA={shouldHideCommonCTA} />}
                    <Toaster position="top-right" richColors />
                </div>
            </TagProvider>
        </UserProvider>
    );
} 