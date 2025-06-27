// Server component that generates menu at build time
import { MenuItem } from "./Header";
import { generateMenuWithIndustries } from "./menuConfig";

export interface MenuProviderProps {
  children: (menu: MenuItem[]) => React.ReactNode;
}

/**
 * Server component that generates the menu at build time using server-side Firebase
 * This runs during ISR/SSG build and provides the menu data to client components
 */
export default async function ServerMenuProvider({ children }: MenuProviderProps) {
  // Generate menu at build time using server-side Firebase
  const menu = await generateMenuWithIndustries();
  
  // Pass the generated menu to children
  return <>{children(menu)}</>;
} 