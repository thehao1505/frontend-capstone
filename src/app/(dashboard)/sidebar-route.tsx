'use client';

import { Home } from 'lucide-react';
import { SidebarItem } from './sidebar-item';
import { usePathname } from 'next/navigation';

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const onClick = () => {

  };

  return (
    <div className='flex flex-col gap-y-4 flex-1 justify-center'>
      <ul className='flex flex-col gap-y-3 px-2'>
        <SidebarItem href={pathname} icon={Home} onClick={onClick} />
        <SidebarItem href={pathname} icon={Home} onClick={onClick} />
        <SidebarItem href={pathname} icon={Home} onClick={onClick} />
        <SidebarItem href={pathname} icon={Home} onClick={onClick} />
        <SidebarItem href={pathname} icon={Home} onClick={onClick} />
      </ul>
    </div>
  );
};
