'use client';

import { SidebarRoutes } from './sidebar-route';
import { Logo } from './logo';
import { Logout } from './logout';
export const Sidebar = () => {
  return (
    <aside className='hidden bg-transparent md:flex fixed flex-col w-[76px] left-0 shrink-0 h-full'>
      <Logo />
      <SidebarRoutes />
      <Logout />
    </aside>
  );
};
