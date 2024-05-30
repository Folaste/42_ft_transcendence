import React from 'react';
import SideBar from './SideBar';
import { useLocation, useNavigate } from 'react-router-dom';

function NavBar() {

  const navigate = useNavigate();
  let location = useLocation();
  let activeTab;

  switch (location.pathname)
    {
      case '/chat':
        activeTab = 2;
        break ;
      case '/leaderboard':
        activeTab = 3
        break ;
      case '/hub':
        activeTab = 4;
        break ;
      default:
        activeTab = 0
        break ;
    }
  

  function handleClick(tab:string)
  {
    navigate(tab);
  }

  return (
    <div className="z-50 top-0 fixed text-xl font-bold w-screen p-2 flex flex-row justify-between gap-2 bg-slate-950 bg-opacity-40 hover:bg-opacity-90 ">
      <span className='flex flex-col items-center justify-center group cursor-pointer'>
        <p className='ml-3' onClick={() => handleClick('/')}>Home</p>
          <span className='ml-3 opacity-0 group-hover:opacity-100 -translate-x-5 group-hover:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
      </span>
      <div className=' flex flex-row items-center gap-10'>
        <span className='hidden md:inline-flex flex flex-col items-center group cursor-pointer'>
          <p  onClick={() => handleClick('/chat')}>Chat</p>
          {
            activeTab === 2 ? 
            <span className='w-[100%] h-[3px] bg-orange-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-orange-500' ></span> :
            <span className='opacity-0 group-hover:opacity-100 -translate-x-5 group-hover:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
          }
        </span>
        <span className='hidden md:inline-flex flex flex-col items-center group cursor-pointer group'>
          <p  onClick={() => handleClick('/leaderboard')}>Leaderboard</p>
          {
            activeTab === 3 ? 
            <span className='w-[100%] h-[3px] bg-orange-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-orange-500'></span> :
            <span className='opacity-0 group-hover:opacity-100 -translate-x-5 group-hover:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
          }
        </span>

        <span className='hidden md:inline-flex flex flex-col items-center group cursor-pointer'>
          <p  onClick={() => handleClick('/hub')}>Hub</p>
          {
            activeTab === 4 ? 
            <span className='w-[100%] h-[3px] bg-orange-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-orange-500'></span> :
            <span className='opacity-0 group-hover:opacity-100 -translate-x-5 group-hover:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
          }
        </span>
      </div>
      <span className='flex flex-row  items-center group'>
          <SideBar />
      </span>
    </div>

  );
}

export default NavBar;