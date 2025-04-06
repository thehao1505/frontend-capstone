import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface SidebarItemProps {
  icon: LucideIcon;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const SidebarItem = ({
  icon: Icon,
  href,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          'flex items-center justify-center px-2 py-3 rounded-xl bg-transparent hover:bg-neutral-900 transition',
          isActive && 'bg-neutral-900'
        )}
      >
        <Icon className='size-6 stroke-2 text-neutral-600' />
      </div>
    </Link>
  );
};
