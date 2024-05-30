import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar/navbar";
import { useEffect } from "react";

function Hub() {
    useEffect(() => {
        window.scrollTo(0, 0)
      }, [])

    const navigate = useNavigate();

    const playWithUp = (thereIsUp : boolean) => {
        // Navigate to game and passing information to it
        navigate('/game', { state: { upOrNot: thereIsUp } });
      };

    return (
        <div className=" h-screen">
            <NavBar />
                <div className="bg-[url('/public/gaming3.jpg')] h-[100%] w-[100%] bg-cover bg-no-repeat flex flex-col justify-center text-lg md:text-xl font-bold items-center  gap-y-7">
                    <p className="hidden md:block text-xl md:text-2xl">Congratulations you passed the first test.</p>
                    <p className="hidden md:block text-xl md:text-2xl pb-10">Ready to fight ?</p>
                    <button onClick={() => playWithUp(false)} className="bg-orange-400 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-orange-500 md:pr-14 md:pl-14 p-3 mt-5 md:mt-0 rounded-full">Play</button>
                    <button onClick={() => playWithUp(true)} className="bg-purple-600 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-purple-700 md:pr-14 md:pl-14 p-3 mb-10 md:mb-0 rounded-full">Play with powerups</button>
                </div>
        </div>
    );
}

export {Hub};