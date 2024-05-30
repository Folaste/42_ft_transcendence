import React, { useContext, useEffect, useState } from "react";
import NavBar from "../NavBar/navbar";
import api from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { selectDatas } from "../../stores/selector";
import { iUser } from "./Interfaces";
import { SocketContext } from "../../context/SocketContext";
import { AppDispatch } from "../../stores/store";
import { resetProfile } from "../../stores/Profile";
import { useNavigate } from "react-router-dom";

function Friends() {
    const [input, setInput] = useState("");
    const data = useSelector(selectDatas);
    const [userList, setUserList] = useState<iUser[]>();
    const generalSocket = useContext(SocketContext);
    const [error, setError] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/friend/allFriends/' + data.id).then(res => {
            setUserList(res.data);
            setError(false);
        }).catch(err => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                generalSocket.emit('unsetUserId');
                navigate('/');
            }
            else
                setError(true);
        })

        generalSocket.on('RequestAccepted', (friend:number) => {
            setUserList((prevItems) => prevItems?.filter(data => data.id !== friend));
        })

        generalSocket.on('friendDeleted', () => {
            api.get('/friend/allFriends/' + data.id).then(res => {
                setUserList(res.data);
            }).catch(err => {
                if (err.response.data.statusCode === 401)
                {
                    dispatch(resetProfile());
                    generalSocket.emit('unsetUserId');
                    navigate('/');
                }
                else
                    setError(true);
            })
        })

        return () => {
            generalSocket.off('RequestAccepted');
            generalSocket.off('friendDeleted');
        }
    }, [])


    async function handleInputChange(e:any) {
        setInput(e.target.value);
        await api.get('/friend/allFriends/' + data.id).then(res => {
            setUserList(res.data);
        }).catch(err => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                generalSocket.emit('unsetUserId');
                navigate('/');
            }
            else
                setError(true);
        })
    }

    const sendFriendRequest = (userToAdd:number) => {
        //check if user is connected
        generalSocket.emit('getUserStatus', userToAdd, true);
        generalSocket.emit('beMyFriend', data.id, data.nickname, userToAdd);
    
        api.get('/friend/allFriends/' + data.id).then(res => {
            setUserList(res.data);
        }).catch(err => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                generalSocket.emit('unsetUserId');
                navigate('/');
            }
            else
                setError(true);
        })
    }

    return (
        <div className="flex items-center flex-col w-[100%] bg-slate-900 overflow-auto h-[100%] font-bold" id="scrollbar">
            <NavBar></NavBar>
            {error ? <div className="flex flex-col justify-center items-center w-[100%] h-[100%]">Error while fetching users to add..</div>  :
                <div className="pt-24 flex h-[95%] w-[90%] flex-col items-center ">
                    <div className="flex flex-row gap-x-2 items-center bg-slate-950 px-3 rounded-lg mb-5">
                        <input placeholder="Search for users to add as friends.."
                        className="rounded-lg h-16 text-center w-[100%] outline-none bg-slate-950"
                        onChange={(e) => handleInputChange(e)}>
                        </input>
                        <i className="fa fa-solid fa-search fa-xl"></i>
                    </div>
                    <div className=" h-[100%] w-[100%] overflow-hidden" >
                        <div className="overflow-auto items-start text-center flex flex-row flex-wrap" id="scrollbar">
                        {userList?.filter(data => data.nickname.includes(input)).map((filteredUsers) => {
                            return (
                                (
                                    <div key={filteredUsers.id} className=" flex flex-col items-center m-2 justify-between rounded-lg bg-slate-950 p-3 gap-y-1 max-w-[200px] min-w-[200px] overflow-hidden">
                                        <img src={'http://localhost:3001/user/picture/' + (filteredUsers.avatarURI !== "undefined" ? filteredUsers.avatarURI : "avatar.png")} alt="Profile" className='m-y-3 block object-cover' style={{width: 50, height: 50, borderRadius: 300/ 2}}></img>
                                        <p className="overflow-hidden">{filteredUsers.nickname}</p>
                                        <button className="bg-gradient-to-r from-orange-400 to-orange-300 p-2 rounded-lg text-stone-950  text-sm" onClick={() => sendFriendRequest(filteredUsers.id)}>Add friend</button>
                                    </div>
                            ));
                        })}
                        {(input === "" || userList?.filter(data => data.login42.includes(input)).length) ? null : <p className="items-center m-2 justify-between rounded-lg  p-3 gap-y-1 w-[100%] overflow-hidden">No results found</p>}
                    </div>
                </div>
         </div>
            }
           
        </div>
        );
}

export default Friends;