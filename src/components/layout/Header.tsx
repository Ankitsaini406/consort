// ModularHeader.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Phone as FeatherPhone } from "lucide-react";
import { menu } from "@/components/layout/menuConfig";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button3 } from "@/ui/components/Button3";

export type MenuItem = {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
  featured?: {
    title: string;
    description: string;
    url: string;
  };
};

type Crumb = { title: string; url?: string };

interface HeaderProps {
  logo?: { url: string; src: string; alt: string; title: string };
  menu?: MenuItem[];
  auth?: { contact: { title: string; url: string } };
  breadcrumbs?: Crumb[];
}

export default function Header({
  logo = {
    url: "/",
    src: "",
    alt: "Consort Logo",
    title: "Consort",
  },
  menu = [],
  auth = { contact: { title: "Contact us", url: "/contact-us" } },
  breadcrumbs,
}: HeaderProps) {
  const pathname = usePathname();
  const crumbs = useMemo(() => {
    if (breadcrumbs?.length) return breadcrumbs;
    if (pathname === "/") return [{ title: "Home", url: "/" }];
    const parts = pathname.replace(/^\/+|\/+$/g, "").split("/");
    return [
      { title: "Home", url: "/" },
      ...parts.map((seg, i) => {
        const title = seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const isLast = i === parts.length - 1;
        // Make root listing pages unclickable (no page.tsx exists), keep others clickable (except last)
        const nonClickableRootPages = ["industries", "solution", "events"];
        const url = isLast || nonClickableRootPages.includes(seg) ? undefined : "/" + parts.slice(0, i + 1).join("/");
        return { title, url };
      }),
    ];
  }, [pathname, breadcrumbs]);

  return (
    <>
      <TopBar />
      <HeaderBar logo={logo} menu={menu} auth={auth} />
      <BreadcrumbBar crumbs={crumbs} pathname={pathname} />
    </>
  );
}

const TopBar = () => <div className="top-gradient-bar" />;

const HeaderBar = ({ logo, menu, auth }: Pick<HeaderProps, "logo" | "menu" | "auth">) => (
  // To refine the header bar, adjust padding, borders, or background colors here.
  <header className="max-w-[1140px] w-full mx-auto">
    <div className="flex items-center justify-between border-b-2 border-gray-200 my-2 px-6 py-4 mobile:px-6">
      <Logo logo={logo} />
      <DesktopNav menu={menu} auth={auth} />
      <MobileNav logo={logo} menu={menu} auth={auth} />
    </div>
  </header>
);

// Inline SVG Logo Component - Renders instantly with zero network requests
const ConsortLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 1955 241"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Consort Digital"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M1941.16 61.9936H1862.61L1862.59 226.826C1862.59 234.378 1856.39 240.512 1848.75 240.512H1815.2C1807.83 240.512 1801.8 234.8 1801.39 227.608L1801.39 227.495V61.9936H1722.82C1715.18 61.9936 1708.98 55.8617 1708.98 48.3074V14.1754C1708.98 6.61927 1715.18 0.487305 1722.82 0.487305H1941.16C1948.8 0.487305 1955 6.61927 1955 14.1754V48.3074C1955 55.8617 1948.8 61.9936 1941.16 61.9936Z" fill="#324086"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M1603.33 61.617C1612.72 61.617 1616.76 65.9702 1616.76 74.2022V89.7846C1616.76 98.0185 1612.72 102.37 1603.33 102.37L1466.66 102.565C1458.21 102.565 1449.81 105.511 1443.55 111.54C1437.15 117.704 1434.15 127.128 1434.15 135.127V226.76C1434.15 234.097 1439.97 240.099 1447.31 240.51L1447.37 240.512H1481.69C1489.39 240.512 1495.65 234.34 1495.65 226.74V163.922L1575.99 163.623L1609.9 235.037C1611.49 238.208 1614.78 240.212 1618.36 240.212H1667.86C1674.87 240.212 1679.45 232.952 1676.33 226.747L1676.33 226.753L1676.32 226.724L1641.59 153.688C1651.68 148.092 1660.15 140.52 1666.96 130.992C1675.76 118.671 1680.17 104.755 1680.17 89.369V74.7431C1680.17 61.0912 1676.66 48.5639 1669.65 37.2632C1662.94 26.4486 1654.02 17.7267 1642.95 11.1457C1642.58 10.9258 1641.71 10.4224 1641.71 10.4224C1630.12 3.79515 1617.3 0.487305 1603.33 0.487305L1447.42 0.78696L1447.36 0.790818C1440.02 1.19007 1434.18 7.1982 1434.18 14.541V48.1818C1434.18 55.4128 1439.84 61.3496 1447.03 61.9108L1447.11 61.9166L1603.33 61.617Z" fill="#324086"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M1316.47 0.487305C1363.53 0.487305 1401.74 38.3096 1401.74 84.8973V155.502C1401.74 202.088 1363.53 240.512 1316.47 240.512L1222.99 239.912C1175.93 239.912 1137.71 202.088 1137.71 155.502V84.8973C1137.71 38.3096 1175.93 0.487305 1222.99 0.487305L1316.47 0.487305ZM1339.56 155.502V84.8973C1339.56 72.2828 1329.21 62.0384 1316.47 62.0384H1222.99C1210.25 62.0384 1199.9 72.2828 1199.9 84.8973V155.502C1199.9 168.116 1210.25 178.361 1222.99 178.361H1316.47C1329.21 178.361 1339.56 168.116 1339.56 155.502Z" fill="#324086"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M1029.72 168.775C1027.78 168.141 915.889 128.838 915.889 128.838C895.207 122.452 883.019 112.602 875.805 102.96C865.176 88.7588 865.27 74.9045 865.287 72.569C865.287 72.4944 865.289 72.4312 865.289 72.3814C865.289 49.5219 870.367 34.7124 882.228 21.463C894.12 8.17919 912.859 0.506394 940.431 0.506394L940.349 0.508308C940.994 0.498736 1037.14 0.493048 1076.93 0.489219L1091.69 0.487305L1091.71 0.489219C1099.04 0.642369 1104.97 6.44674 1105.22 13.706V48.758C1104.97 55.8814 1099.2 61.6264 1091.97 61.9327H1091.93C1078.55 61.9385 1021.1 61.969 981.648 61.9882L940.236 62.0073C936.817 62.0073 935.121 64.4749 935.121 67.0632C935.121 70.086 938.456 71.4356 940.873 72.2243C942.818 72.858 1054.71 108.691 1054.71 108.691C1075.39 115.078 1087.58 125.55 1094.79 135.191C1105.42 149.393 1105.33 166.095 1105.31 168.43V168.618C1105.31 191.477 1100.23 206.287 1088.37 219.538C1076.47 232.82 1057.74 240.493 1030.16 240.493L1030.25 240.491C1029.6 240.5 933.491 240.508 893.692 240.51L878.908 240.512L878.885 240.51C871.562 240.359 865.63 234.552 865.374 227.293V192.276L865.375 192.241C865.626 185.118 871.395 179.375 878.625 179.066H878.669C892.021 179.061 954.071 179.03 993.521 179.011L1030.36 178.992C1033.78 178.992 1035.47 176.524 1035.47 173.936C1035.47 170.913 1032.14 169.564 1029.72 168.775Z" fill="#324086"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M633.69 62.0384C631.916 62.0384 630.19 63.6024 630.19 65.3578V226.923C630.076 234.441 623.876 240.512 616.258 240.512H581.997C574.305 240.512 568.061 234.327 568.061 226.706V26.0585C568.061 11.9457 579.628 0.487305 593.873 0.487305L746.886 0.487305C793.91 0.487305 832.087 38.3096 832.087 84.8973V226.706C832.087 234.327 825.845 240.512 818.153 240.512H783.911C776.221 240.512 769.979 234.327 769.979 226.708L769.96 84.8973C769.96 72.2828 759.622 62.0384 746.886 62.0384H633.69Z" fill="#324086"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M451.185 0.487305C498.248 0.487305 536.457 38.3096 536.457 84.8973V156.102C536.457 202.688 498.248 240.512 451.185 240.512H357.705C310.642 240.512 272.43 202.688 272.43 156.102V84.8973C272.43 38.3096 310.642 0.487305 357.705 0.487305L451.185 0.487305ZM474.275 156.102V84.8973C474.275 72.2828 463.928 62.0384 451.185 62.0384H357.705C344.962 62.0384 334.613 72.2828 334.613 84.8973V156.102C334.613 168.716 344.962 178.961 357.705 178.961H451.185C463.928 178.961 474.275 168.716 474.275 156.102Z" fill="#324086"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M63.7614 177.074C65.324 178.814 67.914 178.88 70.8132 178.88L226.083 178.885C233.778 178.885 240.025 185.07 240.025 192.689V226.707C240.025 234.327 233.778 240.512 226.083 240.512H25.8275C11.5733 240.512 0 229.053 0 214.941V84.8973C0 38.3096 38.2024 0.487305 85.2566 0.487305L226.083 0.487305C233.778 0.487305 240.025 6.67373 240.025 14.2908V48.3161C240.025 55.9351 233.778 62.1196 226.083 62.1196H85.2566C72.5592 62.1196 62.251 72.3272 62.251 84.8973V171.324C62.251 174.099 62.7319 175.924 63.7614 177.074Z" fill="#324086"/>
  </svg>
);

const Logo = ({ logo }: { logo?: HeaderProps["logo"] }) => {
  return (
    <Link href={logo?.url ?? "/"} className="flex items-center gap-2 text-lg font-semibold">
      <ConsortLogo className="lg:h-[24px] md:h-5 mobile:h-4 w-auto" />
      <span className="sr-only">{logo?.title ?? "Consort"}</span>
    </Link>
  );
};

const DesktopNav = ({ menu, auth }: Pick<HeaderProps, "menu" | "auth">) => (
  // To refine the desktop navigation, adjust gaps and item alignment here.
  <nav className="hidden items-center gap-6 lg:flex">
    <NavigationMenu>
      {/* To refine the main menu list, adjust text size, color, and font family. */}
      <NavigationMenuList className="text-muted-foreground font-manrope">
        {menu?.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.items?.length ? (
              <>
                {/* To refine the dropdown trigger, adjust font size, weight, and hover effects. */}
                <NavigationMenuTrigger className="font-manrope">{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent className="animate-in fade-in slide-in-from-top-2 duration-300 ease-out [--enter-opacity:0%] [--exit-opacity:0%] [--enter-translate-y:-2rem] [--exit-translate-y:-1.5rem] backdrop-blur-sm">
                  {/* To refine the dropdown grid layout, adjust width, columns, and gaps. */}
                  <ul className="grid gap-3 p-3 md:w-[420px] lg:w-[760px] lg:grid-cols-[.4fr_1fr]">
                    <li className="row-span-2 hidden lg:block">
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.featured?.url ?? item.url}
                          // To refine the featured link, adjust background, padding, and text styles.
                          className="flex h-full w-full flex-col justify-end shadow-md rounded bg-gradient-to-br from-brand-600 to-brand-900 p-4 no-underline"
                        >
                          <div className="mb-2 mt-4 text-lg text-white font-manrope font-bold leading-tight tracking-tight">{item.featured?.title ?? item.title}</div>
                          <p className="text-xs text-white font-manrope leading-tight text-white/65">
                            {item.featured?.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {/* To refine the sub-item grid, adjust columns and gaps. */}
                    <div className="grid grid-cols-2 gap-0">
                      {item.items.map((sub) => (
                        <ListItem
                          key={sub.title}
                          href={sub.url}
                          title={sub.title}
                          description={sub.description}
                          className="!font-manrope gap-0"
                          titleClassName="text-body text-consort-blue !leading-tight !tracking-tight"
                          descriptionClassName="text-xs line-clamp-2"
                        />
                      ))}
                    </div>
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                href={item.url}
                // To refine the simple navigation link, adjust padding, text size, and hover effects.
                className="rounded-md px-4 py-2 text-lg font-manrope font-medium hover:bg-muted hover:text-accent-foreground"
              >
                {item.title}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
    {auth && (
      // To refine the contact button, adjust colors, padding, and border radius.
      <Button asChild variant="outline" className="!bg-[#324086] !text-white rounded-3xl font-manrope">
        <Link href={auth.contact.url}>{auth.contact.title}</Link>
      </Button>
    )}
  </nav>
);

const MobileNav = ({ logo, menu, auth }: Pick<HeaderProps, "logo" | "menu" | "auth">) => {
  const [open, setOpen] = useState(false);

  return (
    // To refine the mobile navigation, adjust the trigger button and sheet content here.
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button3 variant="neutral-tertiary" size="small">
            <Menu className="h-5 w-5" />
          </Button3>
        </SheetTrigger>
        {/* To refine the mobile sheet, adjust width and background color. */}
        <SheetContent side="left" className="w-[320px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="mt-1 w-36">
              {/* <Logo logo={logo} /> */}
            </SheetTitle>
          </SheetHeader>
          {/* To refine the mobile accordion menu, adjust spacing and text styles. */}
          <Accordion type="single" collapsible className="mt-6 space-y-2 font-manrope">
            {menu?.map((item) => (
              <AccordionItem key={item.title} value={item.title}>
                {item.items?.length ? (
                  <>
                    <AccordionTrigger className="p-2 !font-semibold text-consort-blue lg:text-2xl md:text-xl mobile:text-body font-semibold no-underline hover:text-consort-red transition-colors duration-200">{item.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1">
                      {item.items.map((sub) => (
                        <SubLink key={sub.title} item={sub} onClose={() => setOpen(false)} />
                      ))}
                    </AccordionContent>
                  </>
                ) : (
                  <Link 
                    href={item.url} 
                    className="block py-1.5 text-body font-semibold hover:text-consort-red active:text-consort-red no-underline transition-colors duration-200"
                    onClick={() => setOpen(false)}
                  >
                    {item.title}
                  </Link>
                )}
              </AccordionItem>
            ))}
          </Accordion>
          {auth && (
            // To refine the mobile contact button, adjust colors and positioning.
            <div className="mt-6 w-full">
              
              <div className="flex flex-col gap-2 items-center mt-10 mx-auto">
                
                <Button3 variant="brand-primary" size="medium" onClick={() => setOpen(false)}>
                  <Link href={auth.contact.url}>{auth.contact.title}</Link>
                </Button3>
                <div className="w-32 mt-8 mx-auto">
                  <Logo
                    logo={logo}
                  />
                  </div>
                  <h3 className="text-body-lg font-body-xl text-center text-consort-red">#TrustYourResponse</h3>
                <div className="flex flex-col gap-4 items-center mx-auto">
                  <p className="text-caption mt-2 text-center font-caption text-muted-foreground">
                    Support: +91 97655 44760 
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const BreadcrumbBar = ({ crumbs, pathname }: { crumbs: Crumb[]; pathname: string }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    // To refine the breadcrumb bar, adjust padding, colors, and alignment.
    <div className="max-w-[1140px] mx-auto w-full px-6 py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      {mounted && pathname !== "/" ? (
        // To refine breadcrumb items, adjust text color, font, and separators.
        <Breadcrumb className="!flex list-none items-center gap-1.5 text-caption font-caption text-muted-foreground">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <React.Fragment key={c.title}>
                <BreadcrumbItem>
                  {c.url ? (
                    <BreadcrumbLink href={c.url}>{c.title}</BreadcrumbLink>
                  ) : (
                    <span className="font-semibold text-consort-red">{c.title}</span>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </Breadcrumb>
      ) : pathname !== "/" && !mounted ? (
        // Show skeleton during hydration for non-home pages
        <div className="flex items-center gap-1.5">
          <div className="animate-pulse h-4 bg-neutral-200 rounded w-12"></div>
          <div className="text-muted-foreground">/</div>
          <div className="animate-pulse h-4 bg-neutral-200 rounded w-20"></div>
        </div>
      ) : (
        <div />
      )}
      {/* To refine the support contact info, adjust text styles and icon. */}
      <div className="flex items-center gap-1 justify-end mobile:hidden">
        <FeatherPhone className="h-4 w-4 text-muted-foreground" />
        <p className="text-caption font-caption text-muted-foreground">
          Support: +91 97655 44760
        </p>
      </div>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    description?: string;
    titleClassName?: string;
    descriptionClassName?: string;
  }
>(
  (
    { className, title, description, titleClassName, descriptionClassName, ...props },
    ref
  ) => (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          // To refine the list item links, adjust padding, colors, and hover effects.
          className={cn(
            "min-w-[160px] block select-none space-y-1 rounded-sm p-3 text-sm leading-snug text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            className
          )}
          {...props}
        >
          {/* To refine list item title, adjust font weight and color. */}
          <span
            className={cn(
              "block !text-body-bold text-consort-blue leading-tight tracking-tight",
              titleClassName
            )}
          >
            {title}
          </span>
          {/* To refine list item description, adjust text color and line clamping. */}
          <span
            className={cn(
              "block text-sm font-medium text-muted-foreground",
              descriptionClassName
            )}
          >
            {description}
          </span>
        </a>
      </NavigationMenuLink>
    </li>
  )
);
ListItem.displayName = "ListItem";

const SubLink = ({ item, onClose }: { item: MenuItem; onClose: () => void }) => (
  // To refine the mobile sub-links, adjust padding, icon styles, and text.
  <Link 
    href={item.url} 
    className="flex items-start gap-3 rounded-md p-2 hover:bg-muted w-full group transition-all duration-200 no-underline"
    onClick={onClose}
  >
    {item.icon && <span className="text-primary group-hover:text-consort-red transition-colors duration-200">{item.icon}</span>}
    <div>
      <div className="text-body font-semibold text-consort-blue font-manrope group-hover:text-consort-red group-active:text-consort-red transition-colors duration-200">{item.title}</div>
      {item.description && <p className="text-sm line-clamp-3 text-muted-foreground font-manrope">{item.description}</p>}
    </div>
  </Link>
);
