import React from 'react'
import Stop from '../../images/stop.png'
import NavBar from '../NavBar/navbar';

function ErrorPage()
{
    return (
        <>
            <NavBar />
            <div className='text-5xl font-bold gap-10 w-screen h-screen flex flex-col justify-center items-center text-center bg-slate-900'>
                <img src={Stop} alt="Stop"></img>
                <p>404 Page Not Found</p>
            </div>
        </>
    );
}

export default ErrorPage;