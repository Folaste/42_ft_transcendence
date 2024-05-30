import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDatas, selectStatus } from '../../stores/selector';
import { useNavigate } from 'react-router-dom';
import { resetProfile, updateSideBar, updateStatus } from '../../stores/Profile';
import { SocketContext } from '../../context/SocketContext';

function SideBar()
{
    
    const Open:string = 'z-10 text-base transition-all transform duration-500 ease-in-out top-0 right-0 bg-slate-950 opacity-100 fixed h-screen  w-[100%] lg:hidden flex flex-col justify-between items-center h-screen translate-x-full'
    const Close:string = 'text-base transition-all transform duration-500 top-0 ease-in-out right-0 bg-slate-950 opacity-100 fixed h-screen  w-[100%] lg:hidden translate-x-0 flex flex-col justify-between items-center'
    const [showSidebar, setShowSidebar] = useState(false);
    const genericHamburgerLine = `block lg:hidden z-30 h-1 w-6 my-1 rounded-full bg-white transition ease transform duration-300`;
    const sideBar = useRef<HTMLDivElement>(null);
    const openButton = useRef<HTMLButtonElement>(null);
    useSelector(selectStatus);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const data = useSelector(selectDatas);

    const socket = useContext(SocketContext);

    function handleLogout()
    {
        const newStatus = false;
        socket.emit('changeUserStatus', 'disconnected');
        dispatch(updateStatus(newStatus));
        dispatch(resetProfile());
        socket.emit('unsetUserId');
        navigate("/");
    }

    useEffect(() =>
    {
            let handleClickOutside = (event:any) =>
            {
                if (openButton.current?.contains(event.target))
                {
                    setShowSidebar(!showSidebar);
                    dispatch(updateSideBar(!showSidebar));
                }
                else if (!sideBar.current?.contains(event.target))
                {
                    const status = false
                    setShowSidebar(false);
                    dispatch(updateSideBar(status));
                }

            };
            document.addEventListener('click', handleClickOutside)
            return() =>
            {
                document.removeEventListener("click", handleClickOutside);
            } 
        }
    );


    return (
        <div className='z-50 font-bold'>
            <p className='text-xl top-[17px] fixed right-20 text-center justify-center items-center max-w-[125px] lg:max-w-[250px] overflow-hidden '>{data.nickname}</p>
            <button
            className="flex flex-col h-12 w-12 rounded justify-center items-center"
            ref={openButton}
            >
                        {}

                {}
                <img src={'http://localhost:3001/user/picture/' + (data.avatarURI !== "undefined" ? data.avatarURI : "avatar.png")} alt="Profile" className='hidden lg:block object-cover' style={{width: 300, height: 300, borderRadius: 300/ 2}}></img>
                <div
                    className={`${genericHamburgerLine} ${
                    showSidebar
                        ? "rotate-45 translate-y-3 opacity-100"
                        : "opacity-100"
                    }`}
                />
                <div
                    className={`${genericHamburgerLine} ${
                    showSidebar ? "opacity-0" : "opacity-100"
                    }`}
                />
                <div
                    className={`${genericHamburgerLine} ${
                    showSidebar
                        ? "-rotate-45 -translate-y-3 opacity-100"
                        : "opacity-100"
                    }`}
                />
            </button>


            {}
            <div className={`hidden lg:block flex flex-col divide-slate-800 divide-y justify-center items-center text-sm  fixed top-[75px] right-2 bg-slate-950 rounded-md transform ${!showSidebar ? 'opacity-0 w-0 -translate-y-5' : 'w-56 opacity-100'} transition ease-in`}>
                <div onClick={() => navigate('/profile')} className='rounded-t-md p-3 px-3 flex flex-row justify-between items-center hover:bg-purple-500 transition ease-in '>
                    <i className='fa fa-solid fa-user'></i>
                    <button >Profile</button>
                </div>
                <div className='p-3 px-3 flex flex-row justify-between items-center hover:bg-purple-500 transition ease-in' onClick={() => navigate('/settings')}>
                    <i className='fa fa-solid fa-gear'></i>
                    <button >Settings</button>
                </div>
                <div onClick={handleLogout} className='p-3 px-3 rounded-b-md flex flex-row justify-between items-center hover:bg-purple-500 transition ease-in'>
                    <i className='fa fa-solid fa-right-from-bracket'></i>
                    <button >Logout</button>
                </div>
            </div>


            <div className={showSidebar ? Close : Open} ref={sideBar}>
                <div className='flex flex-row text-xl h-16 p-2 pt-3 mb-5 justify-center items-center '>
                    {}
                    <p className={`max-w-[300px] overflow-hidden ${showSidebar ? null : "hidden"}`}>{data.nickname}</p>
                </div>
                <div className='flex items-center flex-col justify-between h-screen'>
                    <div className='flex flex-col gap-4 items-center text-xl'>
                        <div className='flex flex-col items-center group/tab1'>
                            <p onClick={() => navigate('/')} className='cursor-pointer '>Home</p>
                            <span className='opacity-0 group-hover/tab1:opacity-100 -translate-x-5 group-hover/tab1:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
                        </div>
                        <div className='flex flex-col items-center group/tab2'>
                            <p onClick={() => navigate('/chat')} className='cursor-pointer '>Chat</p>
                            <span className='opacity-0 group-hover/tab2:opacity-100 -translate-x-5 group-hover/tab2:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
                        </div>
                        <div className='flex flex-col items-center group/tab2'>
                            <p onClick={() => navigate('/profile')} className='cursor-pointer '>Profile</p>
                            <span className='opacity-0 group-hover/tab2:opacity-100 -translate-x-5 group-hover/tab2:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
                        </div>
                        <div className='flex flex-col items-center group/tab3'>
                            <p onClick={() => navigate('/Leaderboard')} className='cursor-pointer '>Leaderboard</p>
                            <span className='opacity-0 group-hover/tab3:opacity-100 -translate-x-5 group-hover/tab3:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
                        </div>
                        <div className='flex flex-col items-center group/tab4'>
                            <p onClick={() => navigate('/hub')} className='cursor-pointer '>Hub</p>
                            <span className='opacity-0 group-hover/tab4:opacity-100 -translate-x-5 group-hover/tab4:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
                        </div>
                        <div className='flex flex-col items-center group/tab5'>
                            <p className='cursor-pointer' onClick={() => navigate('/settings')}>Settings</p>
                            <span className='opacity-0 group-hover/tab5:opacity-100 -translate-x-5 group-hover/tab5:translate-x-0 transition ease-in w-[100%] h-[3px] bg-purple-400 rounded-lg shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700'></span> 
                        </div>
                    </div>
                    <div className='p-10 text-xl items-center text-center'>
                        {}
                        <button onClick={handleLogout} className='bg-red-500 rounded-full h-14 w-44'>Logout</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SideBar;