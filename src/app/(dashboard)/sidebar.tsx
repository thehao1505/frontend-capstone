'use client';

import { SidebarRoutes } from './sidebar-route';
import { Logo } from './logo';
export const Sidebar = () => {
  return (
    <aside className='hidden bg-transparent lg:flex fixed flex-col w-[76px] left-0 shrink-0 h-full'>
      <Logo />
      <SidebarRoutes />
    </aside>
  );
};
