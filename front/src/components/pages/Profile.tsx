import NavBar from "../NavBar/navbar";
import { useDispatch, useSelector } from 'react-redux';
import { selectDatas } from '../../stores/selector';
import api from "../../api/axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "./Interfaces";
import { SocketContext } from "../../context/SocketContext";
import { resetProfile } from "../../stores/Profile";
import { AppDispatch } from "../../stores/store";
import '../../chat.css';

function Profile() {

    interface iUser {
        id: number,
        login42: string,
        nickname: string,
        avatarURI: string,
        email: string,
    }

    interface iGame {
        id:number,
        date:Date,
        power_ups:boolean,
        disconnect_right:boolean,
        disconnect_left:boolean,
        victory_left:boolean,
        victory_right:boolean,
        score_left:number,
        score_right:number,
        player_left: iUser,
        player_right: iUser
    }

    interface iFriends {
        id:number;
        user_left: iUser;
        user_right: iUser
    }

    const userToFind = new URLSearchParams(window.location.search).get("user");
    const userToSearch = useSelector(selectDatas).login42;
    const datas = useSelector(selectDatas);
    const [error, setError] = useState(false);
    let friends: iFriends[];
    let matches: iGame[];
    let FriendsInfo: { id: number; user: iUser; }[];
    const [dataMap, setDataMap] = useState<{ id: number; user: iUser; }[]>();
    const [matchMap, setMatchMap] = useState<iGame[]>();
    const [info, setInfo] = useState<iUser>();
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const [friendStatus, setFriendStatus] = useState<{id:number, status:string}[]>();
    const [stats, setStats] = useState<{victoryCl:number, loseCl:number, victoryPU:number, losePU:number}>({victoryCl: 0, loseCl: 0, victoryPU: 0, losePU: 0});
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        fetchInformation();
    }, [userToFind])

    function getStats(matches:iGame[])
    {
        let matchPU = matches.filter((match) => match.power_ups);
        let matchCl = matches.filter((match) => !match.power_ups);

        let victoryCl:number = 0;
        let loseCl:number = 0;
        let victoryPU:number = 0;
        let losePU:number = 0;

        matchCl.forEach(match => {
            if (match.player_left && match.victory_left)
                loseCl++;
            else if (match.player_right && match.victory_right)
                loseCl++;
            else if (match.player_left && match.victory_right)
                victoryCl++;
            else if (match.player_right && match.victory_left)
                victoryCl++;
        })

        matchPU.forEach(match => {
            if (match.player_left && match.victory_left)
                losePU++;
            else if (match.player_right && match.victory_right)
                losePU++;
            else if (match.player_left && match.victory_right)
                victoryPU++;
            else if (match.player_right && match.victory_left)
                victoryPU++;
        })

        setStats({victoryCl:victoryCl, loseCl:loseCl, victoryPU:victoryPU, losePU:losePU});
    }

    async function fetchInformation()
    {
        let user;
        if (userToFind)
        {
            user = userToFind;
            console.log(user);
        }
        else
        {
            user = userToSearch;
        }
        await api.get('user/info/' + user).then(res => {
            if (!res.data[0])
            {
                setError(true);
                return ;
            }
            setInfo(res.data[0]);
            const friendR = res.data[0].friends_right;
            const friendL = res.data[0].friends_left;
            friends = friendR.concat(friendL);
            FriendsInfo = friends.map((user) => {
                const { user_left, user_right, ...rest } = user;
                return { user: user_left || user_right, ...rest };
            });
            setDataMap(FriendsInfo);

            const matchR = res.data[0].matches_right;
            const matchL = res.data[0].matches_left;
            matches = matchR.concat(matchL);
            matches.sort(function(a, b){
                const dateB = new Date(a.date).getTime();
                const dateA = new Date(b.date).getTime();
                return dateA > dateB ? 1 : -1;
            });
            setMatchMap(matches);
            getStats(matches);
            socket.emit('getAllUsersStatus', FriendsInfo);
            }).catch(err => {
                if (err.response.data.statusCode === 401)
                {
                    dispatch(resetProfile());
                    socket.emit('unsetUserId');
                    navigate('/');
                }
                else
                    setError(true);
            })
    }

    useEffect(() => {
        socket.on('allUsersStatus', (usersStatus: {id:number, status:string}[]) => {
            setFriendStatus(usersStatus);
          });

        socket.on('statusChangement', () => {
                socket.emit('getAllUsersStatus', FriendsInfo);
        });

        socket.on('newFriendAccepted', () => {
            fetchInformation();
        })

        socket.on('friendDeleted', () => {
            fetchInformation();
        })

        return () => {
            socket.off('allUsersStatus');
            socket.off('statusChangement');
            socket.off('friendDeleted');
            socket.off('newFriendAccepted');
        }
    }, [])

    function removeFriend(friendId:number)
    {
        api.post('/friend/deleteOneFriend', {idOne: info?.id, idTwo: friendId}).then(() => {
            socket.emit('friendDelete', friendId);
            fetchInformation();
        }).catch(err => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                socket.emit('unsetUserId');
                navigate('/');
            }
            else
                setError(true);
        })
    }

    
    return (
        <div className="flex items-center flex-col w-[100%] bg-slate-900 overflow-auto h-[100%] font-bold " id="scrollbar">
            <NavBar />
            {
                error ?
                <p className="flex flex-col justify-center items-center w-[100%] h-screen">
                    Error, can't load the profile
                </p> :
                <div id="scrollbar" className="pt-16 flex h-[95%] w-[90%] flex-col items-center">
                    <div className="bg-[url('/public/bg.svg')] bg-cover md:bg-contain my-5 w-[90%] items-center text-center flex flex-col md:flex-row p-4 rounded-md justify-between">
                        <div className="min-w-[250px] md:w-[100%] items-center flex flex-col gap-y-5">
                            <img src={'http://localhost:3001/user/picture/' + (userToFind ?  info?.avatarURI :  datas.avatarURI)} alt="Profile" className="object-cover w-[200px] h-[200px] lg:w-[250px] lg:h-[250px]" style={{borderRadius: 300/ 2}} ></img>
                            <p className="text-xl">{info?.nickname}</p>
                        </div>
                        <div className="hidden md:inline-flex text-sm lg:text-base bg-slate-950 bg-opacity-80 h-[80%] w-[100%] flex flex-col justify-center m-3 rounded-lg items-center text-center">
                            <div className="w-[100%] flex flex-col justify-center items-center text-center mb-5 gap-y-3">
                                <p >Classic Mode</p>
                                <span className="bg-orange-400 shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-orange-500 w-24 h-[3px] inline-block rounded-lg"></span>
                            </div>
                            <div>
                                <p>Match Won: {stats?.victoryCl}</p>
                                <p>Match lost: {stats?.loseCl}</p>
                                <p>Winrate: {(stats.victoryCl + stats.loseCl !== 0) ? (Math.floor((stats?.victoryCl / (stats?.victoryCl + stats?.loseCl)) * 100)) : 0}%</p>
                            </div>
                        </div>
                            <div className="hidden md:inline-flex text-sm lg:text-base bg-slate-950 bg-opacity-80 h-[80%] w-[100%] flex flex-col justify-center m-5 rounded-lg">
                                <div className="w-[100%] flex flex-col justify-center items-center text-center mb-5 gap-y-3">
                                    <p >Power Up Mode</p>
                                    <span className="bg-purple-500 shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-700 w-24 h-[3px] inline-block rounded-lg"></span>
                                </div>
                                <div>
                                    <p>Match Won: {stats?.victoryPU}</p>
                                    <p>Match lost: {stats?.losePU}</p>
                                    <p>Winrate: {(stats.victoryPU + stats.losePU !== 0) ? (Math.floor((stats?.victoryPU / (stats?.victoryPU + stats?.losePU)) * 100)) : 0}%</p>
                                </div>
                            </div>
                    </div>
                    <div id="scrollbar" className="bg-slate-900 w-[90%] items-center text-center flex flex-col md:flex-row sm:overflow-hidden pb-3 font-bold text-sm lg:text-base">
                        <div id="scrollbar" className={`${!userToFind ? 'hidden md:block': 'hidden'}  w-[100%] md:w-[30%] bg-slate-900 h-[100%] mr-5 rounded-lg `} >
                            <div className="overflow-auto h-[100%]" id="scrollbar">
                                <div className="flex flex-col items-center mb-3 mx-2 ">
                                    <div className="grid grid-cols-3 w-[100%] items-center">
                                        <div className="col-start-2 flex flex-col items-center">
                                            <p className=" p-1">Friend List</p>
                                            <span className="bg-orange-400 shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-orange-500 w-24 h-[3px] inline-block rounded-lg"></span>
                                        </div>
                                        <i className="text-right fa fa-duotone fa-circle-plus p-1 fa-xl mt-1" onClick={() => navigate('/friends')}></i>
                                    </div>
                                </div>
                            {dataMap?.map((data) => {
                                return (
                                    (
                                <div key={'friend' + data.id.toString()} className="grid grid-cols-2 lg:grid-cols-3 items-center m-2 justify-between rounded-lg bg-slate-950 p-1">
                                    <img src={'http://localhost:3001/user/picture/' + (data?.user.avatarURI !== undefined ? data?.user.avatarURI : "avatar.png")} alt="Profile" className='m-y-3 hidden lg:block object-cover' style={{width: 50, height: 50, borderRadius: 300/ 2}}></img>
                                    <p className="text-center overflow-hidden">{data.user.nickname}</p>
                                    <div className="flex flex-row ">
                                        {
                                            friendStatus?.find((user) => user.id === data.user.id)?.status === 'disconnected' ? 
                                            <i className="text-right fa fa-solid fa-circle p-3 text-gray-500" ></i> : null
                                        }
                                        {
                                            friendStatus?.find((user) => user.id === data.user.id)?.status === 'matchMaking' ? 
                                            <i className="text-right fa fa-solid fa-circle p-3 text-yellow-400" ></i> : null
                                        }
                                        {
                                            friendStatus?.find((user) => user.id === data.user.id)?.status === 'connected' ? 
                                            <i className="text-right fa fa-solid fa-circle p-3 text-green-600" ></i> : null
                                        }
                                        {
                                            friendStatus?.find((user) => user.id === data.user.id)?.status === 'onGame' ? 
                                            <i className="text-right fa fa-solid fa-circle p-3 text-red-600" ></i> : null
                                        }
                                        <i className="fa fa-solid fa-circle-xmark text-red-600 text-right p-3" onClick={() => removeFriend(data.user.id)}></i>
                                    </div>
                                </div>
                                ));
                            })}
                            {
                                    dataMap?.length ? null : <p className="py-3 ">No friends added</p>
                            }
                            </div>
                        </div>
                        <div id="scrollbar" className={`${userToFind ? 'w-[100%] ': 'md:w-[70%] w-[100%] md:ml-5'} h-[100%] rounded-lg text-sm lg:text-base`} >
                            <div className="overflow-auto h-[100%]" id='scrollbar'>
                                <div className="flex flex-col items-center mb-3 mx-2 ">
                                        <div className="grid grid-cols-3 w-[100%] items-center">
                                            <div className="col-start-2 flex flex-col items-center">
                                                <p className=" p-1">History</p>
                                                <span className="bg-purple-500 shadow-[0_0px_5px_0px_rgb(0,0,0,0.3)] shadow-purple-500 w-24 h-[3px] inline-block rounded-lg"></span>
                                            </div>
                                        </div>
                                </div>
                            {matchMap?.map((data) => {
                                return (
                                    (
                                        <div key={'match' + data.id} className="flex flex-col items-center m-2 justify-between rounded-lg bg-slate-950 p-2">
                                            <div className="flex flex-col items-center justify-center">
                                                {data.player_left ? <p >{data.victory_left ? 'Defeat' : 'Victory'} </p> : null}
                                                {data.player_right ? <p >{data.victory_right ? 'Defeat' : 'Victory'} </p> : null}
                                            </div>
                                            <div  className="grid grid-cols-3 w-[100%] items-center ">
                                                <div className="flex flex-row items-center gap-x-2">
                                                {
                                                        data.player_left ? 
                                                    <img className=" hidden md:block object-cover" src={'http://localhost:3001/user/picture/' + data.player_left.avatarURI} alt="Profile" style={{width: 50, height: 50, borderRadius: 300/ 2}}></img>
                                                        :
                                                    <img className=" hidden md:block object-cover" src={'http://localhost:3001/user/picture/' + info?.avatarURI} alt="Profile" style={{width: 50, height: 50, borderRadius: 300/ 2}}></img>
                                                    }
                                                    {/* <img className="hidden md:block object-cover" src={'http://localhost:3001/user/picture/' + (data.player_left ? data.player_left.avatarURI : datas.avatarURI)} alt="Profile" style={{width: 50, height: 50, borderRadius: 300/ 2}}></img> */}
                                                    <p className="mx-2 xl:mx-10">{data.score_left}</p>
                                                    <p className="min-w-[70px] overflow-hidden">{data.player_left ? data.player_left.nickname : info?.nickname}</p>
                                                </div>
                                                <div>
                                                    <p className={`[text-shadow:_0_2px_4px_var(--tw-shadow-color)] z-20 drop-shadow-xl ` + (data.power_ups ? 'text-purple-500 shadow-purple-600' : 'text-orange-400  shadow-orange-400')}>{data.power_ups ? 'PowerUp' : 'Classic'}</p>
                                                </div>
                                                <div className="flex flex-row items-center gap-x-2 justify-end">
                                                    <p className="min-w-[70px] overflow-hidden ">{data.player_right ? data.player_right.nickname : info?.nickname}</p>
                                                    <p className="mx-2 xl:mx-10 ">{data.score_right}</p>
                                                    {
                                                        data.player_right ? 
                                                    <img className=" hidden md:block object-cover" src={'http://localhost:3001/user/picture/' + data.player_right.avatarURI} alt="Profile" style={{width: 50, height: 50, borderRadius: 300/ 2}}></img>
                                                        :
                                                    <img className=" hidden md:block object-cover" src={'http://localhost:3001/user/picture/' + info?.avatarURI} alt="Profile" style={{width: 50, height: 50, borderRadius: 300/ 2}}></img>
                                                    }
                                                    {/* <img className=" hidden md:block object-cover" src={'http://localhost:3001/user/picture/' + (data.player_right ? data.player_right.avatarURI : datas.avatarURI)} alt="Profile" style={{width: 50, height: 50, borderRadius: 300/ 2}}></img> */}
                                                </div>
                                            </div>
                                            <div className="font-normal text-sm items-center">
                                                <p>{formatDate(data.date)}</p>
                                            </div>
                                        </div>
                                    ));
                                })}
                                {
                                    matchMap?.length ? null : <p className="py-3">No recent matches</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export {Profile};