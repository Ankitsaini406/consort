// Server component that provides build-time generated menu to client layout
import { generateMenuWithIndustries } from "./menuConfig";
import ClientLayoutWithMenu from "./ClientLayoutWithMenu";

interface LayoutWithMenuProps {
  children: React.ReactNode;
}

/**
 * Server component that generates menu at build time and passes to client layout
 * This ensures menu is generated during ISR/SSG build using server-side Firebase
 */
export default async function LayoutWithMenu({ children }: LayoutWithMenuProps) {
  // Generate menu at build time using server-side Firebase
  const menu = await generateMenuWithIndustries();
  
  // Pass the generated menu to client layout
  return <ClientLayoutWithMenu menu={menu}>{children}</ClientLayoutWithMenu>;
} 