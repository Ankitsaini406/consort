'use client';

import Header from "./Header";
import { MenuItem } from "./Header";
import { staticMenu } from "./menuConfig";

interface HeaderWrapperProps {
  menu?: MenuItem[];
}

// ISR/SSG-optimized header - accepts menu as props from server component
export default function HeaderWrapper({ menu = staticMenu }: HeaderWrapperProps) {
  return <Header menu={menu} />;
} 