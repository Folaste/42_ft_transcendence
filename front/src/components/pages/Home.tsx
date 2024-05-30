import React, { useContext, useEffect, useState } from 'react';
import computer from '../../images/test2.png'
import argomez from '../../images/argomez2.png'
import vnadal from '../../images/vnadal.png'
import eblondee from '../../images/eblondee.png'
import lvignal from '../../images/lvignal.png'
import fleblanc from '../../images/fleblanc.png'
import controller from '../../images/controller.png'
import chat from '../../images/chat2.png'
import friends from '../../images/friends.png'
import '../../home.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectStatus } from '../../stores/selector';
import {  fetchUserProfile, resetProfile, updateStatus, updateToken } from '../../stores/Profile';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../stores/store';
import api from '../../api/axios';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchChat } from '../../stores/Chat';
import { SocketContext } from '../../context/SocketContext';

function Home() {
    const NavStyle:string = "hover:bg-slate-950 hover:bg-opacity-80 text-xl w-screen h-15 p-4 fixed transition-all ease-in duration-300 flex flex-row justify-center gap-40 z-40 ";
    const BG:string = NavStyle + "bg-slate-950 bg-opacity-80";
    const about = React.useRef<HTMLInputElement>(null);
    const play = React.useRef<HTMLInputElement>(null);
    const banner = React.useRef<HTMLInputElement>(null);
    const [color, setColor] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const status = useSelector(selectStatus);
    const navigate = useNavigate();
    useContext(SocketContext);


    useEffect(() => {
        handleTokenFromQueryParams();
    }, []
    )

    useEffect(() => {
        checkUserStatus();
    }, [])

    async function checkUserStatus() {
        if (status === true)
        {
            api.get('auth/verify/status').then(() => {
            }).catch(err => {
            console.log(err);
                dispatch(resetProfile());
            })
        }
    }

    async function checkUserStatusBeforeNavigate() {
        if (status === true)
        {
            api.get('auth/verify/status').then(() => {
                navigate('/hub');
            }).catch(err => {
                console.log(err);
                dispatch(resetProfile());
            })
        }
    }

    async function handleTokenFromQueryParams()
    {
        const query = new URLSearchParams(window.location.search);
        const accessToken = query.get("TOKEN");
        if (accessToken)
        {
            const newStatus = true;
            const user = query.get("USER");
            dispatch(updateToken(accessToken));
            if (user)
            {
                try
                {
                    const res = await dispatch(fetchUserProfile({username:user, token:accessToken}));
                    await dispatch(fetchChat({username: user, token:accessToken}));
                    unwrapResult(res);
                    const twofa = query.get("2FA");
                    if (twofa === 'true')
                        navigate("/TwoFactor");
                    else
                    {
                        dispatch(updateStatus(newStatus));
                        const signIn = query.get('signIn')
                        if (signIn === 'false')
                            navigate('/Settings');
                        else
                            navigate("/Hub");
                    }
                }
                catch (rejectedValueOrSerializedError)
                {
                        dispatch(resetProfile());
                        navigate("/");           
                }
            }
            else
                navigate("/");           
        }
    }

    const changeHeader = () => 
    {
        if (window.scrollY >= 90)
            setColor(true)
        else
            setColor(false)
    };

    const handlePlay = () => {
     play.current?.scrollIntoView({behavior: 'smooth'});
  };

  const handleAbout = () => {
    about.current?.scrollIntoView({behavior: 'smooth'});
 };

 const handleBanner = () => {
    banner.current?.scrollIntoView({behavior: 'smooth'});
 };

    window.addEventListener('scroll', changeHeader)

  return (
    <span>
        <section ref={banner} className="h-screen bg-cover bg-no-repeat  bg-[url('/public/wave2.svg')] bg-center bg-slate-950" >
            <header className={!color ? NavStyle : BG}>
                <button onClick={handleBanner} className='hidden xl:block font-bold p-2'> NeonPong </button>
                <button onClick={handlePlay} className='hover:translate-y-1 transition-all ease-in font-bold border-white border-4 rounded-full px-5 hover:border-none hover:bg-gradient-to-r from-orange-400 to-orange-300'> Play </button>
                <button onClick={handleAbout} className='hidden xl:block font-bold p-2' > About us </button>
            </header>
            <div className='group [text-shadow:_0_2px_4px_var(--tw-shadow-color)] z-20 text-slate-950 drop-shadow-xl shadow-slate-800 text-3xl md:text-5xl font-bold flex flex-col h-screen w-[100%] delay-100 items-center justify-center text-center mx-auto px-2 gap-y-8'>
                    <p>WELCOME TO TRANSCENDENCE</p>
                    <p className='text-3xl'>Log in to play</p>
            </div>
        </section>
        <div className='dark:bg-gradient-to-b from-slate-950 to-blue-950 font-bold flex flex-col justify-evenly'>
            <div ref={play} className='w-[100%] text-2xl text-stone-950 dark:text-white xl:p-40 font-bold flex flex-col items-center justify-center'>
                <div className='m-2 xl:mb-9 flex flex-wrap flex-row justify-center items-center xl:bg-blob bg-no-repeat bg-left bg-contain '>
                    <div className='flex flex-col items-center xl:m-10 text-xl xl:text-2xl gap-3 xl:gap-5'>
                        <p> Play to one of the first ever arcade game!</p>
                        <p> Challenge your friends to take rank 1 spot</p>
                        <p>Are you ready for the battle ?</p>
                    </div>
                    <img alt="" className="xl:scale-100 scale-50" src={computer}></img>
                </div>
                {!status ? 
                    <a className='bg-gradient-to-r from-orange-400 to-orange-300 p-5 xl:p-8 rounded-full text-stone-950 xl:mt-10 mb-14 xl:mb-32' href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2af20fa1445ac8bbad46b6816890ffa42ff0107f65106d1490e0f50fc6843d55&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fredirect42&response_type=code
                    ">Log In</a>
                    : 
                    <button onClick={() => checkUserStatusBeforeNavigate()} className='bg-gradient-to-r from-orange-400 to-orange-300 p-5 xl:p-8 rounded-full text-stone-950 xl:mt-10 mb-14 xl:mb-32'>Play</button>
                }
                <div className='flex flex-row justify-center flex-wrap items-center gap-10 xl:gap-40 mb-10 xl:scale-100 scale-75'>
                    <div className='flex flex-col justify-center items-center text-center gap-y-10'>
                        <img alt="" src={controller}></img>
                        Play Online
                    </div>
                    <div className='flex flex-col justifu-center items-center text-center gap-y-10'>
                        <img alt="" src={chat}></img>
                        Chat with all the players
                    </div>
                    <div className='flex flex-col justifu-center items-center text-center gap-y-10'>
                        <img alt="" src={friends}></img>
                        Make friends
                    </div>
                </div>
            </div>
            <svg  className="w-[100%] rotate-180" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 130" preserveAspectRatio="none" ><path  d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="shape-fill" fill="#FB9744" fillOpacity="1"></path><path  d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="shape-fill" fill="#FB9744" fillOpacity="1"></path><path  d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="shape-fill" fill="#FB9744" fillOpacity="1"></path></svg>
            <svg  className="w-[100%]" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 130" preserveAspectRatio="none" ><path  d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="shape-fill" fill="#FB9744" fillOpacity="1"></path><path  d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="shape-fill" fill="#FB9744" fillOpacity="1"></path><path  d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="shape-fill" fill="#FB9744" fillOpacity="1"></path></svg>
            <div className='pb-10 text-3xl dark:text-white flex flex-col justify-center items-center xl:mt-20 xl:scale-90 scale-75' ref={about}>
                <p className='pb-32 text-3xl md:text-5xl'>
                    About our amazing team
                </p>
                <div className='flex flex-row justify-center items-center flex-wrap gap-20'>
                    <div className='flex flex-col justify-center items-center text-center'>
                        <img alt="arthur" className='mb-10' src={argomez}></img>
                        Arthur
                    </div>
                    <div className='flex flex-col justify-center items-center text-center'>
                        <img alt="verane" className='mb-10' src={vnadal}></img>
                        Vérane
                    </div>
                    <div className='flex flex-col justify-center items-center text-center'>
                        <img alt="florian" className='mb-10 rounded' src={fleblanc}></img>
                        Florian
                    </div>
                    <div className='flex flex-col justify-center items-center text-center'>
                        <img alt="eliot" className='mb-10' src={eblondee}></img>
                        Eliot
                    </div>
                    <div className='flex flex-col justify-center items-center text-center'>
                        <img alt="lolan" className='mb-10' src={lvignal}></img>
                        Lola
                    </div>
                </div>
            </div>
        </div>
    </span>
  );
}

export default Home;