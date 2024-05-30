import React, { useContext, useState } from "react";
import NavBar from "../NavBar/navbar";
import { useDispatch, useSelector } from "react-redux";
import { selectDatas, selectToken } from "../../stores/selector";
import '../../chat.css';
import api from "../../api/axios";
import { AppDispatch } from "../../stores/store";
import { fetchUserProfile, resetProfile, updateAuth2F, updateNickname } from "../../stores/Profile";
import { SocketContext } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {

    const data = useSelector(selectDatas);
    const dispatch = useDispatch<AppDispatch>();
    const [file, setFile] = useState<any>();
    const token = useSelector(selectToken);
    const [errorUsername, setErrorUsername] = useState('');
    const [errorPicture, setErrorPicture] = useState('');
    const generalSocket = useContext(SocketContext);
    const navigate = useNavigate();

    function handleChangeAuth()
    {
        let newAuth: boolean;
        const req = {auth2F: false};
        if (!data.auth2F)
        {
            newAuth = true;
            req.auth2F = true;
        }
        else if (data.auth2F)
            newAuth = false;
        api.put('user', req).then(() => {
            dispatch(updateAuth2F(newAuth));
        }).catch(err => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                generalSocket.emit('unsetUserId');
                navigate('/');
            }
        })
    }

    function handleChangeNickname(e: any)
    {
        e.preventDefault();
        const data = {
            nickname: e.target[0].value
        };
        api.put('user', data).then(() =>{
            dispatch(updateNickname(e.target[0].value))
            setErrorUsername('');
        }).catch(err => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                generalSocket.emit('unsetUserId');
                navigate('/');
            }
            else
                setErrorUsername('Username already taken.');
        })
    }

    function handleFileChange(e:any)
    {
        setFile(e.target.files[0]);
    }

    function handleUploadSubmit()
    {
        if (!file)
            return ;
        const formData = new FormData();
        formData.append('test', file, file.name);
        api.post('user/changePicture', formData).then(() => {
            dispatch(fetchUserProfile({username: data.login42, token:token}));
            setErrorPicture('');
        }).catch(err => {
            if (err.response.data.statusCode === 401)
            {
                dispatch(resetProfile());
                generalSocket.emit('unsetUserId');
                navigate('/');
            }
            else
                setErrorPicture('Upload failed, the file uploaded must be an image.');
        })
    }

    return (
        <div className="bg-slate-900 h-screen text-center overflow-auto text-lg lg:text-xl font-bold" id="scrollbar">
            <NavBar></NavBar>
            <div className="p-16 mt-6 lg:mt-24 flex flex-col justify-center items-center gap-y-4">
                <p className="text-2xl">Profile settings</p>
                <div className="flex flex-col justify-center items-center gap-y-4">
                    <img src={'http://localhost:3001/user/picture/' + (data.avatarURI !== "undefined" ? data.avatarURI : "avatar.png")} alt="Profile" className="flex flex-col justify-center items-center object-cover" id='round' style={{width: 300, height: 300, borderRadius: 300/ 2}} ></img>
                    <div className="flex flex-row justify-center items-center gap-x-4 w-[80%]">
                        <label className="w-44 bg-slate-600 h-10 flex flex-col justify-center text-center rounded-lg text-lg">
                            <p>Upload File</p>
                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e)} ></input>
                        </label>
                        <label className="w-44 bg-slate-600 h-10 flex flex-col text-center justify-center rounded-lg text-lg">
                            <button onClick={handleUploadSubmit} className="">Save file</button>
                        </label>
                    </div>
                    {errorPicture !== '' ? <p className="text-xs text-red-700 italic">{errorPicture}</p> : null}
                </div>
                <form className="flex flex-col gap-y-4 items-center justify-center text-center" onSubmit={handleChangeNickname}>
                    <input required placeholder={`${data.nickname}`} className="w-[80%] text-center rounded-lg outline-none text-white bg-slate-600 p-2 text-lg" type="text"></input>
                    {errorUsername !== '' ? <p className="text-xs text-red-700 italic">{errorUsername}</p> : null}
                    <button type='submit' className="bg-gradient-to-r from-orange-400 to-orange-300 p-2 lg:p-4 rounded-full text-stone-950  text-lg" >Change your username</button>
                </form>
                <div className="flex flex-row justify-center items-center gap-x-4 ">
                        <p>Two factor authentification {data.auth2F ? 'enabled' : 'disabled'}</p>
                    <label className={`${!data.auth2F ? "bg-white" : "bg-purple-500"} cursor-pointer rounded-full w-16 h-8 flex flex-row overflow-auto transition ease-in`}>
                        <button id='check' className="peer" onClick={handleChangeAuth}></button>
                        <span className={`${!data.auth2F ? "bg-purple-500 translate-x-1" : "bg-white translate-x-8"} 'transition ease-in w-6 h-6 bg-purple-500 rounded-full   translate-y-test`}></span>
                    </label>
                </div>
            </div>
        </div>
    );
}