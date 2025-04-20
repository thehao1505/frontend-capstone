import { Sidebar } from '../../features/dashboard/components/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className='bg-neutral-950'>
      <Sidebar />
      <div className='flex flex-col h-full items-center'>
        <div className='flex flex-col w-[640px] items-center justify-center'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
