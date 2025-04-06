import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className='bg-neutral-950'>
      <Sidebar />
      <div className='flex flex-col h-full items-center'>
        <div className='flex flex-col w-[640px] items-center justify-center'>
          <Navbar />
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
