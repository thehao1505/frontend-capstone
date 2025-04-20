'use client';

import { FeedCard } from "@/features/dashboard/components/feed-card";
import { Navbar } from "../../features/dashboard/components/navbar";
import CreatePostModal from "@/features/dashboard/components/create-post-modal";
import useCurrentUser from "@/features/dashboard/hook/useCurrentUser";

const DashboardPage = () => {
  const { currentUser } = useCurrentUser();

  return (
    <>
      <Navbar
        title='For you'
        showOptionsButton={false}
        showBackButton={false}
      />
      <div className='bg-neutral-900 border-[1px] border-neutral-800 min-h-screen h-full w-full rounded-t-3xl'>
        <div className='h-auto'>
          <div className='flex flex-col mt-2'>
            <CreatePostModal currentUser={currentUser} />
            <FeedCard currentUser={currentUser}/>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
