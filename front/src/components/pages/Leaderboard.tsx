import { useDispatch, useSelector } from "react-redux";
import NavBar from "../NavBar/navbar";
import { selectDatas } from "../../stores/selector";
import { useContext, useEffect, useState } from "react";
import api from "../../api/axios";
import { iLeaderBoard } from "./Interfaces";
import { AppDispatch } from "../../stores/store";
import { useNavigate } from "react-router-dom";
import { resetProfile } from "../../stores/Profile";
import { SocketContext } from "../../context/SocketContext";

function Leaderboard() {
    useSelector(selectDatas);
    const [leaderboardInfo, setLeaderboardInfo] = useState<iLeaderBoard[]>([]);
    const [Podium, setPodium] = useState<iLeaderBoard[]>([]);
    const [error, setError] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const generalSocket = useContext(SocketContext);

    useEffect(() => {
        api.get('user/ranking/leaderboard').then((res) =>
        {
            setPodium(res.data.top3);
            setLeaderboardInfo(res.data.top10);
            setError(false);
        }).catch((err) => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                generalSocket.emit('unsetUserId');
                navigate('/');
            }
            else
                setError(true);
        })
    }, [])

    return (
        <div className="flex items-center flex-col w-[100%] bg-slate-900 overflow-auto h-[100%] font-bold" id="scrollbar">
            <NavBar />
            {error ? <div className="flex flex-col justify-center items-center w-[100%] h-[100%]">Error while loading leaderboard..</div> :
                <div id="" className="pt-16 flex h-[95%] w-[90%] flex-col items-center">
                    <div className=" bg-slate-950 my-5  w-[40%] items-center text-center flex flex-col p-2 rounded-md justify-between">
                        {Podium.length > 0 ? 
                            <div className="flex flex-col gap-y-2 items-center w-[100%]">
                                <i className="fa fa-solid fa-trophy fa-2xl text-yellow-500 mb-5 mt-5 [text-shadow:_0_2px_4px_var(--tw-shadow-color)] shadow-yellow-600"></i>
                                <img src={'http://localhost:3001/user/picture/' + (Podium[0].user.avatarURI !== "undefined" ? Podium[0].user.avatarURI : "avatar.png")} alt="Profile" className="hidden sm:inline-block object-cover w-[100px] h-[100px] border-1 border-orange-400 shadow-[0_0px_15px_0px_rgb(0,0,0,0.3)] shadow-orange-500 " style={{borderRadius: 300/ 2}} ></img>
                                <p className="w-[50%] overflow-hidden">{Podium[0].user.nickname}</p>
                            </div> : null
                        }
                        <div className="flex flex-row justify-center w-[100%]">
                            {
                                Podium.length > 1 ?
                                    <div className="flex flex-col gap-y-2 items-center w-[40%] ">
                                        <i className="fa fa-solid fa-2 fa-xl text-gray-300 mb-5 mt-5 [text-shadow:_0_2px_4px_var(--tw-shadow-color)] shadow-yellow-600"></i>
                                        <img src={'http://localhost:3001/user/picture/' + (Podium[1].user.avatarURI !== "undefined" ? Podium[1].user.avatarURI : "avatar.png")} alt="Profile" className="hidden md:inline-block object-cover w-[90px] h-[90px] border-1 border-orange-400 shadow-[0_0px_20px_0px_rgb(0,0,0,0.3)] shadow-orange-500 " style={{borderRadius: 300/ 2}} ></img>
                                        <p className="w-[100%] overflow-hidden ">{Podium[1].user.nickname}</p>
                                    </div> : null
                            }
                            {
                                Podium.length > 2 ? 
                                    <div className="flex flex-col gap-y-2 items-center w-[40%]">
                                        <i className="fa fa-solid fa-3 fa-xl text-amber-700 mb-5 mt-5 [text-shadow:_0_2px_4px_var(--tw-shadow-color)] shadow-amber-900"></i>
                                        <img src={'http://localhost:3001/user/picture/' + (Podium[2].user.avatarURI !== "undefined" ? Podium[2].user.avatarURI : "avatar.png")} alt="Profile" className="hidden md:inline-block object-cover w-[90px] h-[90px] border-1 border-orange-400 shadow-[0_0px_15px_0px_rgb(0,0,0,0.3)] shadow-orange-500 " style={{borderRadius: 300/ 2}} ></img>
                                        <p className="w-[100%] overflow-hidden">{Podium[2].user.nickname}</p>
                                    </div> : null
                            }
                        </div>
                    </div>
                    <div className=" w-[50%] items-center text-center flex flex-col lg:overflow-hidden rounded-lg">
                        <div className=" overflow-auto h-[100%] flex flex-col gap-y-2 w-[100%] mb-3 bg-slate-950 rounded-lg" id='scrollbar'>
                            <div className="hidden lg:inline-flex flex flex-col w-[100%] mb-3 rounded-lg p-5 bg-slate-950">
                                <div className="grid grid-cols-3 my-1 hidden lg:inline-grid mb-3">
                                    <p className="text-left px-3">Ranking</p>
                                    <p>User</p>
                                    <p className="text-right px-3 hidden lg:block">Total Matches</p>
                                </div>
                                <span className="hidden lg:inline-flex  bg-orange-400 shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-orange-500 w-[100%] h-[3px] rounded-lg"></span>
                            </div>
                            {leaderboardInfo.map((leaderboard, index) => {
                                return (
                                    <div key={index} className="p-5 bg-slate-950 rounded-lg grid grid-cols-2 lg:grid-cols-3 items-center gap-x-3 ">
                                        <p className="text-left px-3 text-purple-500 shadow-purple-600 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] rounded-lg border-2 border-purple-500 w-10">{index + 3 + 1}</p>
                                        <div className="flex flex-row text-center justify-center items-center  gap-x-3">
                                            <img src={'http://localhost:3001/user/picture/' + (leaderboard.user.avatarURI !== "undefined" ? leaderboard.user.avatarURI : "avatar.png")} alt="Profile" className="hidden md:inline-block object-cover w-[50px] h-[50px] " style={{borderRadius: 300/ 2}} ></img>
                                            <p>{leaderboard.user.nickname}</p>
                                        </div>
                                        <p className="hidden lg:block text-right px-3">{leaderboard.totalMatches}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                }
            
        </div>
    );
}

export {Leaderboard};