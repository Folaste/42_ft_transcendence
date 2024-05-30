import * as React from 'react';
import NavBar from "../NavBar/navbar";
import '../../chat.css';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/axios';
import { selectDatas, selectToken } from '../../stores/selector';
import * as interfaces from './Interfaces';
import { useNavigate } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { SocketContext } from '../../context/SocketContext';
import { fetchUserProfile } from '../../stores/Profile';
import { AppDispatch } from '../../stores/store';


const staff:interfaces.iUser = {
    id:-1,
    login42:"STAFF",
    nickname:"STAFF",
    auth2F:false,
    avatarURI:"avatar.png",
    email:"staff@staff.com",
    blockedUsers:[]
}

const chatroomTest:interfaces.iChatroom = {
    id: 0,
    hashed_pwd: "",
    name: "",
    type: "private",
    userChatroom: [],
    messages: [] 
}

const pendingInvitationTest:interfaces.iPendingInvitation = {
    id: 0,
    user: staff,
    chatroom: chatroomTest
}

const staffUserChatroom:interfaces.iUserChatroom = {
    chatroom: chatroomTest,
    id: 0,
    is_admin: false,
    is_banned: false,
    is_muted: false,
    is_owner: false,
    muted_timer: new Date(),
    user: staff
}

function Chat() {
    
    const [activeChat, setActiveChat] = React.useState(0);
    const userLogged:interfaces.iUser = useSelector(selectDatas);
    const token = useSelector(selectToken);
    const generalSocket = React.useContext(SocketContext);
    const askToPlay = (upOrNot: boolean,  userdId_1:number, userdId_2:number|undefined) => {
        generalSocket.emit('inviteToPlay', userdId_1, userLogged.nickname, userdId_2, upOrNot);
    }

    const navigate = useNavigate();
    const [userChatroom, setUserChatroom] = React.useState<interfaces.iUserChatroom>(staffUserChatroom);
    

    // Scroll to bottom function
    const scrollMessages = () => {
        var element = document.getElementById("displayMessages");
        if (element)
            element.scrollTop = element.scrollHeight;
    };
    const dispatch = useDispatch<AppDispatch>();
    
    

    // Constrol variable to change color of text on textarea
    const [textAreaColor, setTextAreaColor] = React.useState("text-white");
    const handleTextAreaColor = (color:string) => {
        setTextAreaColor(color);
    };
    
    const [userSocket, setUserSocket] = React.useState<Socket | null>(null);

    React.useEffect(() => {
        

        let socketTest = io('http://localhost:3001/chat');

        setUserSocket(socketTest);

        socketTest.emit('setUserId', userLogged.id);

        socketTest.on('getNewMessage', (messageData:interfaces.iMessage) => {
            setAllMessagesOnChatroom((allMessagesOnChatroom) => [...allMessagesOnChatroom, messageData]);
        });

        generalSocket.on('opponentConnect', (userId_2 : number, upOrNot : boolean) => {
            window.history.pushState({opponentId: userId_2, upOrNot: upOrNot}, '', '/game'); 
            window.location.href = '/game';
        });

        return () => {
            socketTest.off('getNewMessage');
            socketTest.off('updateActiveChannel');
            socketTest.off('UserLeftChannel');
            generalSocket.off('opponentConnect');
            socketTest.disconnect();
            setUserSocket(null);
        }
    }, []);

    React.useEffect(() => {
        userSocket?.on('updateActiveChannel', (chatId:number) => {
            if (chatId === activeChat)
            {
                handleActiveChannelUsers(chatId);
            }
            api.get("http://localhost:3001/userChatroom/getUserChatroom/" + userLogged?.id + "/" + activeChat).then(res => {
                setUserChatroom(res.data);
                handleActiveChannelUsers(res.data.chatroom.id);
                handleOpenChatroomInfosMenu(res.data);
                handleUserChatroomOfLoggedUser(res.data);
            }).catch(err=>{})
        })

        userSocket?.on('UserLeftChannel', (chatId:number) => {
            if (activeChat === chatId)
            {
                handleCentralDivState("");
                handleOpenChatroom(chatroomTest);
            }
            setChannelsListFromDataBase((prevItems) => prevItems?.filter(data => data.id !== chatId))
        })

        return () => {
            userSocket?.off('updateActiveChannel');
            userSocket?.off('UserLeftChannel');
        }
    }, [activeChat])







    

/* ****************************************                                                **************************************** */
/* ****************************************           displayFriendsChannelsList           **************************************** */
/* ****************************************                                                **************************************** */






    /* *****                                                          ***** */
    /* *****       Called on ButtonClick and get Users with DM        ***** */
    /* *****                                                          ***** */

    // usersListState === true -> shown; === false -> hidden
    const [usersListState, setFriendsListState] = React.useState(false);
    const handleFriendsListState = (state:interfaces.iUser|undefined) => {
        api.get('http://localhost:3001/chatroom/getAllDirectMessagesFromUserId/' + userLogged.id).then(
            res => {
                setUsersListFromDataBase(res.data);
            }
        ).catch(err => {})
        if (state === undefined)
            setFriendsListState(!usersListState);
    };
    


    /* *****                                              ***** */
    /* *****       state for chat hover in the list       ***** */
    /* *****                                              ***** */
    
    // to know wich chat must be open and hover in the list
    const [openedChatroom, setOpenedChatroomState] = React.useState<interfaces.iChatroom>(chatroomTest);
    const handleOpenChatroom = (chatroom:interfaces.iChatroom) => {setOpenedChatroomState(chatroom)};



    /* *****                                                      ***** */
    /* *****       Called on ButtonClick and get Chatrooms        ***** */
    /* *****                                                      ***** */

    // channelsListState === true -> shown; === false -> hidden
    const [channelsListState, setChannelsList] = React.useState(false);
    async function handleChannelsListState(state:interfaces.iChatroom|undefined) {
        await api.get('http://localhost:3001/chatroom/getAllChatroomsFromUserId/' + userLogged.id).then(
            res => {
                setChannelsListFromDataBase(res.data);
            }
        ).catch(err => {})
        if (state === undefined)
            setChannelsList(!channelsListState);
    };



    /* *****                                                         ***** */
    /* *****       OnButtonClick, Display All Users with A DM        ***** */
    /* *****                                                         ***** */

    // Display all users Friends
    const [usersListFromDataBase, setUsersListFromDataBase] = React.useState([]);
    const usersList = usersListFromDataBase.map((chatroom:interfaces.iChatroom) =>
        <button key={chatroom.id}
        id={`friend${chatroom.name}`}
        className={`w-[90%] font-bold overflow-hidden flex mt-1 py-2 ml-2 mr-2 hover:bg-slate-950 ${openedChatroom === chatroom ? "bg-slate-950" : undefined} rounded-xl items-center text-sm md:text-base  flex flex-row justify-center md:justify-start`}
        onClick={() => handleOpenedChatroom(chatroom)}>    
            <img className="hidden md:block w-10 h-10 ml-2 mr-3 opacity-100 object-cover rounded-full"
            src={'http://localhost:3001/user/picture/' + (chatroom.userChatroom[0].user.avatarURI !== undefined ? chatroom.userChatroom[0].user.avatarURI : "avatar.png")}
            alt={chatroom.userChatroom[0].user.avatarURI}>
            </img>
            {chatroom.userChatroom[0].user.nickname}
        </button>
    );


    /* *****                                                   ***** */
    /* *****       OnButtonClick, Display All Chatrooms        ***** */
    /* *****                                                   ***** */

    // Display all users Channels
    const [channelsListFromDataBase, setChannelsListFromDataBase] = React.useState<interfaces.iChatroom[]>([]);
    var chatroomsList = channelsListFromDataBase.map((chatroom:interfaces.iChatroom) =>
        <button key={chatroom.id}
        id={`channel${chatroom.id}`}
        className={`w-[90%] overflow-hidden font-bold flex mt-1 py-2 ml-2 mr-2 hover:bg-slate-950 ${openedChatroom === chatroom ? "bg-slate-950" : undefined} rounded-xl items-center text-sm md:text-base flex flex-row justify-center md:justify-start`}
        onClick={() => handleOpenedChatroom(chatroom)}>
            <i className={`hidden md:block w-10 h-10 ml-2 mr-3 pt-1 opacity-100 rounded-full fa-solid fa-c text-2xl
            ${chatroom.type === "public" ? "bg-purple-950" : chatroom.type === "protected" ? "bg-blue-950" : chatroom.type === "private" ? "bg-red-950" : null} `}></i>
            <p>{chatroom.name}
            </p>
        </button>
    );



    /* *****                                        ***** */
    /* *****       ButtonToCreateChannelForm        ***** */
    /* *****                                        ***** */

    // show or hidde createChannelForm
    const handleCreateChannelButton = () => {
        if (centralDivState !== "create")
        {
            handleCentralDivState("create");
            setUserSelectedToStartChat(undefined);
            setUsersListState(false);
            setPublicChatroomListCreateFormState(false);
            setPublicChatroomSelectedToStartChat(undefined);
            setProtectedChatroomListCreateFormState(false);
            setProtectedChatroomSelectedToStartChat(undefined);
            handleOpenChatroom(chatroomTest);
        }
        else
            handleCentralDivState("");
    };


    /* *****                       ***** */
    /* *****       UserList        ***** */
    /* *****                       ***** */

    const displayFriendsListButton = () =>
        <button id="scrollbar" className={`h-auto w-auto m-2 flex flex-row hover:text-orange-500 text-sm md:text-base lg:text-lg flex-wrap font-bold ${usersListState === true ? "text-orange-500" : undefined}`} 
        onClick={() => {handleFriendsListState(undefined);}}>
            Users <i className={`ml-5 mt-1 fa-solid ${usersListState === true ? "fa-chevron-up" : "fa-chevron-down"} md:text-base pr-2`}></i>
        </button>
    ;




    /* *****                          ***** */
    /* *****       ChannelList        ***** */
    /* *****                          ***** */

    const displayChannelsListButton = () =>
        <button id="channelsListButton" className={`h-auto w-auto m-2 flex flex-row hover:text-orange-500 text-sm md:text-base lg:text-lg flex-wrap font-bold ${channelsListState === true ? "text-orange-500" : undefined}`}
        onClick={() => {handleChannelsListState(undefined)}}>
            Channels
            <i className={`ml-5 mt-1 fa-solid ${channelsListState === true ? "fa-chevron-up" : "fa-chevron-down"} md:text-base pr-2`}></i>
        </button>
    ;



    /* *****                              ***** */
    /* *****       AllDivOnTheLeft        ***** */
    /* *****                              ***** */

    // Div on the left
    var displayFriendsChannelsList = () =>
        <div id="channelsDiv" className="w-[20%] py-5">
            <div id="ChannelList" className=" h-[99%] m-2 pt-2 pb-2 flex flex-col bg-slate-950 bg-opacity-40 border-2 rounded-2xl border-purple-950 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-purple-950">
                <div id="scrollbar" className='h-[95%] items-center justify-center overflow-auto'>
                    <div id="ChannelList" className='overflow-auto flex flex-col items-center'>
                        {displayFriendsListButton()}
                        <div className='h-[100%] w-[100%] justify-center items-center flex flex-col'>
                            {usersListState === true ? usersList : undefined}
                        </div>
                        {displayChannelsListButton()}
                        <div  className='h-[100%] w-[100%] justify-center items-center flex flex-col'>
                            {channelsListState === true ? chatroomsList : undefined}
                        </div>
                    </div>
                </div>
                <div className='mt-2 flex justify-center  rounded-lg flex-row font-bold'>
                    <button onClick={handleCreateChannelButton} className='flex flex-row flex-wrap justify-center items-center text-sm md:text-base lg:text-lg gap-x-2'>
                        <p>New Channel</p>
                        <p className={`${centralDivState === "create"  ? "text-orange-400 rotate-45" : "text-purple-400" } font-bold fa-solid fa-plus lg:text-xl md:text-basetext-right' title='Create a New Channel ml-2`}></p>
                    </button>
                </div>
            </div>
        </div>
    ;



























/* ****************************************                                                **************************************** */
/* ****************************************                displayCentralDiv               **************************************** */
/* ****************************************                                                **************************************** */

    /* *****                             ***** */
    /* *****       Reset Highlite        ***** */
    /* *****                             ***** */

    const [UserOpenToSpeak, setUserOpenToSpeak] = React.useState<(interfaces.iUser)>(staff);
    const handleUserOpenToSpeak = (user: interfaces.iUser) => {setUserOpenToSpeak(user)}

    const [userChatroomOfLoggedUser, setUserChatroomOfLoggedUser] = React.useState<(interfaces.iUserChatroom | undefined)>(undefined);
    const handleUserChatroomOfLoggedUser = (user: interfaces.iUserChatroom | undefined) => {setUserChatroomOfLoggedUser(user)}



    /* *****                                     ***** */
    /* *****       visible with users msg        ***** */
    /* *****                                     ***** */

    // onClick set the div visible with users msg
    async function handleOpenedChatroom(chatroom:interfaces.iChatroom|undefined) {
        if (chatroom === undefined)
            return;
        setActiveChat(chatroom.id);
        setAllMessagesOnChatroom([]);
        handleUserOpenToSpeak(staff);
        if (chatroom.type === "DM")
            handleUserOpenToSpeak(chatroom.userChatroom[0]?.user);
            
        handleOpenChatroom(chatroom);
        handleActiveChannelUsers(chatroom?.id);

        handleUserChatroomOfLoggedUser(chatroom.userChatroom?.find((userChatroom) => userChatroom?.user?.id === userLogged.id));

        await api.get("http://localhost:3001/userChatroom/getUserChatroom/" + userLogged?.id + "/" + chatroom?.id).then(res => {
            setUserChatroom(res.data);
        }).catch(err=>{})

        await api.get('http://localhost:3001/message/getFromChatroom/' + chatroom?.id).then(
            res => {
                setAllMessagesOnChatroom(res.data);
                handleCentralDivState("chat");
            }
            ).catch(err => {})

        if (chatroom)
            userSocket?.emit('joinAChat', chatroom?.id);
    };

    /* *****                               ***** */
    /* *****       CentralDiv State        ***** */
    /* *****                               ***** */

    // centralDivState === "" -> hidden; === "create" -> show create form; === "manage" -> show manage form; === "chat" -> show chats
    const [centralDivState, setCentralDivState] = React.useState("");
    const handleCentralDivState = (state:string) => {setCentralDivState(state);};



    /* *****                                            ***** */
    /* *****       handleNewChannelCreationButton       ***** */
    /* *****                                            ***** */

    const [formCreateChatroom, setFormCreateChatroom] = React.useState
    (
        {
            name:"",
            hashed_pwd: "",
            type: "",
            userId_1: 0,
            userId_2: 0,
        }
    );

    const [userSelectedToStartChat, setUserSelectedToStartChat] = React.useState<interfaces.iUser|undefined>(undefined);
    const handleUserSelectedToStartChat = (user:interfaces.iUser) => {
        setUserSelectedToStartChat(user);
        formCreateChatroom.userId_1 = userLogged.id;
        formCreateChatroom.userId_2 = user.id;
        handleUserOpenToSpeak(user);
        formCreateChatroom.type = "DM";
        setUsersListState(!usersListCreateFormState);
    }
    
    async function handleNewChannelCreationButton(){
        if (userLogged.id === formCreateChatroom.userId_2)
            return;
        if ((formCreateChatroom.type === "" && formCreateChatroom.name === "" ) || (formCreateChatroom.type !== "DM" && formCreateChatroom.name === "") || (formCreateChatroom.type === "" && formCreateChatroom.name !== ""))
            return ;
        if (formCreateChatroom.type === "protected" && formCreateChatroom.hashed_pwd === "")
            return ;
        formCreateChatroom.userId_1 = userLogged?.id;
        await api.post("http://localhost:3001/chatroom/createChatroom", formCreateChatroom).then( res => {
            handleFriendsListState(res.data.id);
            handleChannelsListState(res.data);
        }).catch(err => {})
        handleCentralDivState("");
        setFormCreateChatroom({name: "", hashed_pwd: "", type: "", userId_1: 0, userId_2: 0});
    }

    

    /* *****                                  ***** */
    /* *****       usersListCreateForm        ***** */
    /* *****                                  ***** */

    const [usersListCreateFormState, setUsersListState] = React.useState(false);
    async function handleUsersListState() {
        if (publicChatroomListCreateFormState)
            setPublicChatroomListCreateFormState(!publicChatroomListCreateFormState);
        if (protectedChatroomListCreateFormState)
            setProtectedChatroomListCreateFormState(!protectedChatroomListCreateFormState);
        setUsersListState(!usersListCreateFormState);
        await api.get('http://localhost:3001/user/allUsersWithNoDirectMessageWithUserId/' + userLogged.id).then(
            res => {
                setAllUsersButOneLogged(res.data);
            }
        ).catch(err => {})
    };


    // Display all users Friends
    const [allUsersButOneLogged, setAllUsersButOneLogged] = React.useState<interfaces.iUser[]>([]);
    const usersListCreateForm = allUsersButOneLogged.map((user: interfaces.iUser) =>
    <button key={user.id}
    id={`friend${user.id}`}
    className={`h-auto w-[54%] flex mt-1 py-2 ml-4 hover:bg-slate-950 items-center ${userSelectedToStartChat?.nickname === user.login42 ? "bg-slate-900" : undefined} rounded-xl items-center lg:text-base md:text-sm`}
    onClick={() => handleUserSelectedToStartChat(user)}> 
        <img className="w-10 h-10 ml-2 mr-3 opacity-100 object-cover rounded-full" src={'http://localhost:3001/user/picture/'  + (user.avatarURI !== undefined ? user.avatarURI : "avatar.png")} alt={user.avatarURI}></img>
        {user.nickname}
    </button>
    );



    /* *****                                        ***** */
    /* *****          Object Join Chatroom          ***** */
    /* *****                                        ***** */

    let userChatroomCreateObject:{
        isOwner: boolean,
        isAdmin: boolean,
        isMuted: boolean,
        isBanned: boolean,
        userId: number,
        chatroomId: number,
        password: string
    };


    /* *****                                      ***** */
    /* *****       Public List Create Form        ***** */
    /* *****                                      ***** */

    const [publicChatroomSelectedToStartChat, setPublicChatroomSelectedToStartChat] = React.useState<interfaces.iChatroom|undefined>(undefined);
    const handlePublicChatroomSelectedToStartChat = (chatroom:interfaces.iChatroom) => {
        setPublicChatroomSelectedToStartChat(chatroom);
        setPublicChatroomListCreateFormState(!publicChatroomListCreateFormState);
    }

    const [publicChatroomListCreateFormState, setPublicChatroomListCreateFormState] = React.useState(false);
    async function handlePublicChatroomListState() {
        if (usersListCreateFormState)
            setUsersListState(!usersListCreateFormState);
        if (protectedChatroomListCreateFormState)
            setProtectedChatroomListCreateFormState(!protectedChatroomListCreateFormState)
        setPublicChatroomListCreateFormState(!publicChatroomListCreateFormState);
        await api.get('http://localhost:3001/chatroom/getAllPublicChatroomsButFromUserId/' + userLogged.id).then(
            res => {
                setAllPublicChatroomsButAlreadyJoinned(res.data);
            }
        ).catch(err => {})
    };
        
    const [allPublicChatroomsButAlreadyJoinned, setAllPublicChatroomsButAlreadyJoinned] = React.useState([]);
    const publicChatroomsListCreateForm = allPublicChatroomsButAlreadyJoinned.map((chatroom: interfaces.iChatroom) =>
    <button key={chatroom.id}
    id={`friend${chatroom.id}`}
    className={`h-auto w-[54%] flex mt-1 py-2 ml-4 hover:bg-slate-950 items-center ${publicChatroomSelectedToStartChat?.name === chatroom.name ? "bg-slate-950" : undefined} rounded-xl items-center lg:text-base md:text-sm`}
    onClick={() => handlePublicChatroomSelectedToStartChat(chatroom)}> 
        <i className={`w-10 h-10 ml-2 mr-3 pt-1 opacity-100 rounded-full fa-solid fa-c text-2xl bg-purple-950`}></i>
        {chatroom.name}
    </button>
    );

    async function handleJoinSelectedPublicChatroom(chatroomId:number|undefined) {
        if (!chatroomId)
            return;
        userChatroomCreateObject = {
            isOwner: false,
            isAdmin: false,
            isMuted: false,
            isBanned: false,
            userId: userLogged.id,
            chatroomId: chatroomId,
            password: ""
        }
        
        await api.post("/chatroom/joinChatroom", userChatroomCreateObject).then( res => {
            userSocket?.emit('updateUsersChan', chatroomId);
            handleChannelsListState(res.data);
        }).catch(err => {})
        handleCentralDivState("");
        handleOpenChatroom(chatroomTest);
    }




    /* *****                                         ***** */
    /* *****       Protected List Create Form        ***** */
    /* *****                                         ***** */

    const [protectedChatroomSelectedToStartChat, setProtectedChatroomSelectedToStartChat] = React.useState<interfaces.iChatroom|undefined>(undefined);
    const handleProtectedChatroomSelectedToStartChat = (chatroom:interfaces.iChatroom) => {
        setProtectedChatroomSelectedToStartChat(chatroom);
        setProtectedChatroomListCreateFormState(!protectedChatroomListCreateFormState);
    }

    const [protectedChatroomListCreateFormState, setProtectedChatroomListCreateFormState] = React.useState(false);
    async function handleProtectedChatroomListState() {
        if (usersListCreateFormState)
            setUsersListState(!usersListCreateFormState);
        if (publicChatroomListCreateFormState)
            setPublicChatroomListCreateFormState(!publicChatroomListCreateFormState);
        if (privateChatroomListCreateFormState)
            setPrivateChatroomListCreateFormState(!privateChatroomListCreateFormState);
        setProtectedChatroomListCreateFormState(!protectedChatroomListCreateFormState);
        await api.get('http://localhost:3001/chatroom/getAllProtectedChatroomsButFromUserId/' + userLogged.id).then(
            res => {
                setAllProtectedChatroomsButAlreadyJoinned(res.data);
            }
        ).catch(err => {})
    };

    const [allProtectedChatroomsButAlreadyJoinned, setAllProtectedChatroomsButAlreadyJoinned] = React.useState([]);
    const protectedChatroomsListCreateForm = allProtectedChatroomsButAlreadyJoinned.map((chatroom: interfaces.iChatroom) =>
    <button key={chatroom.id}
    id={`friend${chatroom.id}`}
    className={`h-auto w-[54%] flex mt-1 py-2 ml-4 hover:bg-slate-950 items-center ${protectedChatroomSelectedToStartChat?.name === chatroom.name ? "bg-slate-950" : undefined} rounded-xl items-center lg:text-base md:text-sm`}
    onClick={() => handleProtectedChatroomSelectedToStartChat(chatroom)}> 
        <i className={`w-10 h-10 ml-2 mr-3 pt-1 opacity-100 rounded-full fa-solid fa-c text-2xl bg-blue-950`}></i>
        {chatroom.name}
    </button>
    );

    async function handleJoinSelectedProtectedChatroom(chatroomId:number|undefined) {
        if (!chatroomId)
            return;

        userChatroomCreateObject = {
            isOwner: false,
            isAdmin: false,
            isMuted: false,
            isBanned: false,
            userId: userLogged.id,
            chatroomId: chatroomId,
            password: password.password
        }
        if (userChatroomCreateObject.password === "")
            return ;
        
        await api.post("/chatroom/joinChatroom", userChatroomCreateObject).then( async res => {
            setOpenedChatroomState(res.data);
            userSocket?.emit('updateUsersChan', chatroomId);
            handleChannelsListState(res.data);
        }).catch(err => {})
        handleCentralDivState("");
        handleOpenChatroom(chatroomTest);

        setPassword({password: ""});
    }


    /* *****                                         ***** */
    /* *****       Private List Create Form        ***** */
    /* *****                                         ***** */

    const [privateChatroomSelectedToStartChat, setPrivateChatroomSelectedToStartChat] = React.useState<interfaces.iPendingInvitation>(pendingInvitationTest);
    const handlePrivateChatroomSelectedToStartChat = (invitation:interfaces.iPendingInvitation) => {
        setPrivateChatroomSelectedToStartChat(invitation);
        setPrivateChatroomListCreateFormState(!privateChatroomSelectedToStartChat);
    }

    const [privateChatroomListCreateFormState, setPrivateChatroomListCreateFormState] = React.useState(false);
    async function handlePrivateChatroomListState() {
        if (usersListCreateFormState)
            setUsersListState(!usersListCreateFormState);
        if (publicChatroomListCreateFormState)
            setPublicChatroomListCreateFormState(!publicChatroomListCreateFormState);
        if (protectedChatroomListCreateFormState)
            setProtectedChatroomListCreateFormState(!protectedChatroomListCreateFormState);
        setPrivateChatroomListCreateFormState(!privateChatroomListCreateFormState);
        await api.get('http://localhost:3001/invitations/' + userLogged.id).then(
            async res => {
                setAllPrivateChatroomsButAlreadyJoinned(res.data);
            }
        ).catch(err => {})
    };

    const [allPrivateChatroomsButAlreadyJoinned, setAllPrivateChatroomsButAlreadyJoinned] = React.useState<interfaces.iInvitation[]>([]);
    const privateChatroomsListCreateForm = allPrivateChatroomsButAlreadyJoinned.map((invitation: interfaces.iInvitation) =>
    <button key={invitation.id}
    id={`friend${invitation.id}`}
    className={`h-auto w-[54%] flex mt-1 py-2 ml-4 hover:bg-slate-950 items-center ${privateChatroomSelectedToStartChat?.chatroom.name === invitation.chatroom.name ? "bg-slate-950" : undefined} rounded-xl items-center lg:text-base md:text-sm`}
    onClick={() => handlePrivateChatroomSelectedToStartChat(invitation)}> 
        <i className={`w-10 h-10 ml-2 mr-3 pt-1 opacity-100 rounded-full fa-solid fa-c text-2xl bg-red-950`}></i>
        {invitation.chatroom.name}
    </button>
    );

    async function handleJoinSelectedPrivateChatroom(chatroomId:number|undefined) {
        if (!chatroomId)
            return;

        userChatroomCreateObject = {
            isOwner: false,
            isAdmin: false,
            isMuted: false,
            isBanned: false,
            userId: userLogged.id,
            chatroomId: chatroomId,
            password: ""
        }

        await api.post("/chatroom/joinChatroom", userChatroomCreateObject).then(
            async (res) => {
                userSocket?.emit('updateUsersChan', chatroomId);

                handleChannelsListState(res.data);
                setOpenedChatroomState(res.data);
                handleCentralDivState("chat");
                if (openedChatroom.type === 'private')
                    await api.delete('/invitations/' + userLogged.id + "/" + chatroomId).then(()=>{}).catch(err => {})
        }).catch(err => {})
        setPrivateChatroomSelectedToStartChat(pendingInvitationTest);
        setPrivateChatroomListCreateFormState(false);
        handleCentralDivState("");
        handleOpenChatroom(chatroomTest);
    }



    /* *****                                        ***** */
    /* *****       handleManageChannelButton        ***** */
    /* *****                                        ***** */

    async function inviteUser(user: interfaces.iUser)
    {
        api.post('invitations/', {userId:user.id, chatroomId:openedChatroom.id}).then(res => {
            handleManageChannelButton();
        }).catch(err => {})
    }

    const [allUserButChatroom, setAllUserButChatroom] = React.useState<interfaces.iUser[]>([]);


    const invitationsUsers = allUserButChatroom?.map((user) => {
        return (
            <div key={"invitation" + user.id} className='flex flex-row bg-slate-800 w-[100%] items-center rounded-lg justify-between p-2'>
                <div className='flex flex-row items-center gap-x-4'>
                    <img src={'http://localhost:3001/user/picture/' + (user.avatarURI !== undefined ? user.avatarURI : "avatar.png")} alt={user.avatarURI !== undefined ? user.avatarURI : "avatar.png"} className='m-y-3  hidden md:block object-cover' style={{width: 50, height: 50, borderRadius: 300/ 2}}></img>
                    <p className='overflow-hidden' >{user.nickname}</p>
                </div>
                <button className='p-1 bg-purple-400 rounded-lg' onClick={() => inviteUser(user)}>Invite</button>
            </div>
        )
    })

    // set to manage form or chat
    async function handleManageChannelButton() {
        if (centralDivState !== "manage")
        {
            await api.get("http://localhost:3001/chatroom/getAllUsersButFromChatroomId/" + activeChat)
            .then(res=>{
                setAllUserButChatroom(res.data)
                handleCentralDivState("manage");
            }).catch(err => {})
        }
        else
            handleCentralDivState("chat");
    };
    



    /* *****                              ***** */
    /* *****       handle Password        ***** */
    /* *****                              ***** */


    const [password, setPassword] = React.useState({password:""});


    function handlePassword(e:any){setPassword({ ...password, [e.target.name]: e.target.value });};

    function handleChatroomCreationType(e:any){setFormCreateChatroom({...formCreateChatroom, [e.target.name]: e.target.value})}

    /* *****                                ***** */
    /* *****       CreateChannelForm        ***** */
    /* *****                                ***** */

    const [newChannelFormType, setNewChannelFomType] = React.useState<string>("")
    function changeNewChannelFormType(type:string){
        if (type === newChannelFormType)
        {
            setNewChannelFomType("");
            return ;
        }
        setNewChannelFomType(type);
    }

    // Display Create Channel Form
    const displayCreateChannelForm = () => {
        return (
            <div id="scrollbar" className=" h-[99%] m-2 flex text-sm lg:text-base font-bold flex-col items-center overflow-auto rounded-2xl bg-slate-950 bg-opacity-40 border-red-500 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-red-500">
                <div className='flex flex-col justify-center items-center'>
                    <p className='p-5 text-xl md:text-3xl font-bold'>New Channel</p>
                    <div className='w-[100%] flex items-center justify-center mb-5 flex-row'>
                        <button className={` rounded-2xl p-3 m-1  ${newChannelFormType === "join" ? "bg-slate-950" : "bg-slate-800" }`} onClick={() => changeNewChannelFormType("join")}>Join a Channel</button>
                        <button className={` rounded-2xl p-3 m-1  ${newChannelFormType === "create" ? "bg-slate-950" : "bg-slate-800" }`} onClick={() => changeNewChannelFormType("create")}>Create a Channel</button>
                    </div>
                </div>
                {newChannelFormType === "join" ?
                <div className='w-[70%] lg:w-[50%] flex flex-col bg-slate-800 bg-opacity-50 rounded-2xl p-3 text-sm mb-3'>

                    {/*********               Direct Message With a User               *********/}
                    <div className='w-[100%] items-center flex flex-col p-2 gap-y-2'>
                        <div>
                            <p>Direct Message With a User</p>
                        </div>
                        <div className='w-[100%] flex flex-row'>
                            <button id="dropDownUsers" className='w-[100%] flex mt-1 py-2 ml-2 mr-2 bg-slate-950 bg-opacity-80 rounded-xl items-center ' value={userSelectedToStartChat?.login42} onClick={handleUsersListState}>
                                <div className='w-[100%] flex flex-row items-center'>
                                    <img className="w-10 h-10 ml-2 mr-3 opacity-100 object-cover rounded-full" src={'http://localhost:3001/user/picture/' + (userSelectedToStartChat === undefined ? "avatar.png" : userSelectedToStartChat?.avatarURI)} alt={userSelectedToStartChat?.avatarURI}></img>  
                                    {userSelectedToStartChat?.nickname}
                                </div>
                                <div>
                                    <i className={`ml-5 fa-solid ${usersListCreateFormState === true ? "fa-chevron-up" : "fa-chevron-down"}  pr-2`}></i>
                                </div>
                            </button>
                            <button onClick={() => handleNewChannelCreationButton()} className=' justify-center items-center flex rounded-2xl p-2 pl-3 bg-gradient-to-br bg-slate-800 from-green-950'>Start Conversation With</button>
                        </div>
                    </div>
                    {usersListCreateFormState ? usersListCreateForm : null}

                    {/*********               Join a public Chatroom               *********/}
                    <div className='w-[100%] items-center flex flex-col p-2  gap-y-2'>
                        <div>
                            <p>Join a public Chatroom</p>
                        </div>
                        <div className='w-[100%] flex flex-row'>
                            <button id="dropDownUsers" className='w-[100%] flex mt-1 py-2 ml-2 mr-2 bg-slate-950 bg-opacity-80 rounded-xl items-center ' value={publicChatroomSelectedToStartChat?.id} onClick={handlePublicChatroomListState}>
                                <div className='w-[100%] flex flex-row items-center'>
                                <i className={`w-10 h-10 ml-2 mr-3 pt-1 opacity-100 rounded-full fa-solid fa-c text-2xl bg-purple-950`}></i>  
                                    {publicChatroomSelectedToStartChat?.name}
                                </div>
                                <div>
                                    <i className={`ml-5 fa-solid ${publicChatroomListCreateFormState === true ? "fa-chevron-up" : "fa-chevron-down"} md:text-base pr-2`}></i>
                                </div>
                            </button>
                            <button onClick={() => handleJoinSelectedPublicChatroom(publicChatroomSelectedToStartChat?.id)} className='justify-center items-center flex rounded-2xl p-2 pl-3 bg-gradient-to-br bg-slate-800 from-green-950'>Join Public Chatroom</button>
                        </div>
                    </div>
                    {publicChatroomListCreateFormState ? publicChatroomsListCreateForm : null}

                    {/*********               Join a proteted Chatroom               *********/}
                    <div className='w-[100%] items-center flex flex-col p-2  gap-y-2'>
                        <div>
                            <p>Join a protected Chatroom</p>
                        </div>
                        <div className='w-[100%] flex flex-row'>
                            <button id="dropDownUsers" className='w-[100%] flex mt-1 py-2 ml-2 mr-2 bg-slate-950 bg-opacity-80 rounded-xl items-center ' value={protectedChatroomSelectedToStartChat?.id} onClick={handleProtectedChatroomListState}>
                                <div className='w-[100%] flex flex-row items-center'>
                                <i className={`w-10 h-10 ml-2 mr-3 pt-1 opacity-100 rounded-full fa-solid fa-c text-2xl bg-blue-950`}></i>  
                                    {protectedChatroomSelectedToStartChat?.name}
                                </div>
                                <div>
                                    <i className={`ml-5 fa-solid ${protectedChatroomListCreateFormState === true ? "fa-chevron-up" : "fa-chevron-down"} md:text-base pr-2`}></i>
                                </div>
                            </button>
                            <button onClick={() => handleJoinSelectedProtectedChatroom(protectedChatroomSelectedToStartChat?.id)} className='justify-center items-center flex rounded-2xl p-2 pl-3 bg-gradient-to-br bg-slate-800 from-green-950'>Join Protected Chatroom</button>
                        </div>
                    </div>
                    {protectedChatroomListCreateFormState ? protectedChatroomsListCreateForm : null}
                    {protectedChatroomSelectedToStartChat ? <input onChange={handlePassword} id="password" name="password" className='bg-opacity-80 bg-slate-950 rounded-2xl m-3 p-2 outline-none text-center' placeholder='Chatroom Password' type='password'></input> : null}

                    {/*********               Join a private Chatroom               *********/}
                    <div className='w-[100%] items-center flex flex-col p-2  gap-y-2'>
                        <div>
                            <p>Join a private Chatroom</p>
                        </div>
                        <div className='w-[100%] flex flex-row'>
                            <button id="dropDownUsers" className='w-[100%] flex mt-1 py-2 ml-2 mr-2 bg-slate-950 bg-opacity-80 rounded-xl items-center' value={privateChatroomSelectedToStartChat?.id} onClick={handlePrivateChatroomListState}>
                                <div className='w-[100%] flex flex-row items-center'>
                                <i className={`w-10 h-10 ml-2 mr-3 pt-1 opacity-100 rounded-full fa-solid fa-c text-2xl bg-red-950`}></i>  
                                    {privateChatroomSelectedToStartChat?.chatroom.name}
                                </div>
                                <div>
                                    <i className={`ml-5 fa-solid ${privateChatroomListCreateFormState === true ? "fa-chevron-up" : "fa-chevron-down"}  pr-2`}></i>
                                </div>
                            </button>
                            <button onClick={() => handleJoinSelectedPrivateChatroom(privateChatroomSelectedToStartChat?.chatroom.id)} className='justify-center items-center flex rounded-2xl p-2 pl-3 bg-gradient-to-br bg-slate-800 from-green-950'>Join Private Chatroom</button>
                        </div>
                    </div>
                    {privateChatroomListCreateFormState ? privateChatroomsListCreateForm : null}
                    
                </div>
                : null }
                { newChannelFormType === "create" ?
                <div className='w-[50%] flex flex-col bg-slate-950 bg-opacity-50 rounded-2xl p-3 gap-y-3'>
                    <form className=''>
                        <div className='flex flex-row gap-10 items-center justify-center flex-wrap'>
                            <div className='flex flex-row gap-2 justify-center items-center'>
                                <p>Public</p>
                                <input required className='checked:border-[3px] checked:bg-purple-500 border-white appearance-none w-4 h-4 bg-white rounded-lg' type="radio" name="type" value="public" onChange={handleChatroomCreationType}></input>
                            </div>
                            <div className='flex flex-row gap-2 justify-center items-center'>
                                <p>Protected</p>
                                <input required type="radio" name="type" value="protected" className='checked:border-[3px] checked:bg-purple-500 border-white appearance-none w-4 h-4 bg-white rounded-lg' onChange={handleChatroomCreationType}></input>
                            </div>
                            <div className='flex flex-row gap-2 justify-center items-center'>
                                <p>Private</p>
                                <input required className='checked:border-[3px] checked:bg-purple-500 border-white appearance-none w-4 h-4 bg-white rounded-lg' type="radio" name="type" value="private" onChange={handleChatroomCreationType}></input>
                            </div>
                        </div>
                        <div className='gap-5'>
                            <div className='flex flex-col'>
                                <input type='text' name="name" required className='outline-none bg-slate-950 m-2 p-3 rounded-lg' placeholder='Chatroom Name' onChange={handleChatroomCreationType}></input>
                            </div>
                            {formCreateChatroom.type === "protected" ?
                            <div className='flex flex-col '>
                                <input type='text' name="hashed_pwd" required className="outline-none bg-slate-950 m-2 p-3 rounded-lg" placeholder='Chatroom Password' onChange={handleChatroomCreationType}></input>
                            </div> : null}
                        </div>
                    </form>
                    <button onClick={() => handleNewChannelCreationButton()} className='rounded-lg bg-slate-800 p-3'> Create Channel </button>
                </div>
                : null }
            </div>
        );
    };



    /* *****                                ***** */
    /* *****       ManageChannelForm        ***** */
    /* *****                                ***** */

    async function handleChannelManageButton(){
        if (formManageChatroom.type === "protected" && formManageChatroom.hashed_pwd === "")
            return;
        if (formManageChatroom.name === "")
        {
            let test = formManageChatroom;
            test.name = openedChatroom.name;
            setFormManageChatroom(test);
        }
        if (formManageChatroom.type === "")
        {
            let test = formManageChatroom;
            test.type = openedChatroom.type;
            setFormManageChatroom(test);
        }
        if (formManageChatroom.hashed_pwd === "")
        {
            let test = formManageChatroom;
            test.hashed_pwd = openedChatroom.hashed_pwd;
            setFormManageChatroom(test);
        }
        if(openedChatroom.id === undefined)
            openedChatroom.id = activeChat;
        await api.put("http://localhost:3001/chatroom/" + openedChatroom.id, formManageChatroom).then(
            res => {
                setOpenedChatroomState(res.data);
                api.delete('http://localhost:3001/invitations/deleteAllOnChatroom/' + openedChatroom.id).catch(err => {});
        }).catch(err => {})
        setFormManageChatroom({name: "", hashed_pwd: "", type: ""});
    }

    function handleChatroomManageType(e:any){
        setFormManageChatroom({...formManageChatroom, [e.target.name]: e.target.value})
    }

    const [formManageChatroom, setFormManageChatroom] = React.useState<{name:string|undefined,hashed_pwd:string|undefined,type:string|undefined}>
    (
        {
            name:"",
            hashed_pwd: "",
            type: ""
        }
    );

    async function unbanUser(data: interfaces.iUserChatroom)
    {
        api.delete('userChatroom/' + data.id).then(res => {
        }).catch(err => {})
    }
    // Display Manage Channel Form
    const displayManageChannelForm = () => {
        return (
            <div id="scrollbar" className="h-[99%] m-2 text-sm lg:text-base font-bold flex flex-col items-center  overflow-auto rounded-2xl bg-slate-950 bg-opacity-40 border-red-500 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-red-500">
                <p className='p-5 text-xl md:text-3xl font-bold'>Manage Channel</p>
                <div className='w-[50%] flex flex-col bg-slate-950 bg-opacity-50 rounded-2xl gap-y-3 p-3 mb-3'>
                    <form>
                        <div className='flex flex-row gap-10 items-center justify-center flex-wrap m-3'>
                            <div className='flex flex-row gap-2 justify-center items-center'>
                                <p>Public</p>
                                <input required className='checked:border-[3px] checked:bg-purple-500 border-white appearance-none w-4 h-4 bg-white rounded-lg' type="radio" name="type" value="public" onChange={handleChatroomManageType}></input>
                            </div>
                            <div className='flex flex-row gap-2 justify-center items-center'>
                                <p>Protected</p>
                                <input required className='checked:border-[3px] checked:bg-purple-500 border-white appearance-none w-4 h-4 bg-white rounded-lg' type="radio" name="type" value="protected" onChange={handleChatroomManageType}></input>
                            </div>
                            <div className='flex flex-row gap-2 justify-center items-center'>
                                <p>Private</p>
                                <input required className='checked:border-[3px] checked:bg-purple-500 border-white appearance-none w-4 h-4 bg-white rounded-lg' type="radio" name="type" value="private" onChange={handleChatroomManageType}></input>
                            </div>
                        </div>
                        <div className='gap-y-3'>
                            <div className='flex flex-col'>
                                <input type='text' name="name" required className='outline-none bg-slate-950 m-2 p-3 rounded-lg' placeholder='Chatroom Name' onChange={handleChatroomManageType}></input>
                            </div>
                            {formManageChatroom.type === "protected" ?
                            <div className='flex flex-col'>
                                <input type='text' name="hashed_pwd" required className="outline-none bg-slate-950 m-2 p-3 rounded-lg" placeholder='New Chatroom Password' onChange={handleChatroomManageType}></input>
                            </div> : null}
                        </div>
                    </form>
                    <button onClick={() => handleChannelManageButton()} className='rounded-lg bg-slate-800 p-3'> Modify Channel </button>
                </div>
                {openedChatroom.type === "private" ? 
                <div className='w-[70%] md:w-[50%] flex flex-col bg-slate-950 bg-opacity-50 rounded-2xl p-3 mb-3 justify-center items-center'>
                    <p className='text-lg md:text-xl mb-10'>
                        Invitation
                    </p>
                    
                    <div className='flex flex-col w-[90%]'>
                        {invitationsUsers}
                    </div>
                </div> : null}
                {(activeChannelUsers && activeChannelUsers?.filter((user) => user.is_banned === true).length > 0) ?
                    <div className='w-[70%] md:w-[50%] flex flex-col bg-slate-950 bg-opacity-50 rounded-2xl p-3 mb-3 justify-center items-center'>
                        <p className='text-lg md:text-xl mb-10'>
                            Banlist
                        </p>
                        <div className='flex flex-col w-[90%]'>
                            {activeChannelUsers?.filter((user) => user.is_banned === true).map((data) => {
                                if (data === null || data.user === null)
                                    return null;
                                return (
                                    <div key={userChatroom?.id} className='flex flex-row bg-slate-800 w-[100%] items-center rounded-lg justify-between p-2'>
                                        <div className='flex flex-row items-center gap-x-4'>
                                            <img src={'http://localhost:3001/user/picture/' + (data.user.avatarURI !== undefined ? data.user.avatarURI : "avatar.png")} alt={data.user.avatarURI !== undefined ? data.user.avatarURI : "avatar.png"} className='m-y-3  hidden md:block object-cover' style={{width: 50, height: 50, borderRadius: 300/ 2}}></img>
                                            <p className='overflow-hidden' >{data.user.nickname}</p>
                                        </div>
                                        <button className='p-1 bg-purple-400 rounded-lg' onClick={() => unbanUser(data)}>unban</button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                : null
                }                
            </div>
        );
    };



    /* *****                                    ***** */
    /* *****       displayFriendMessages        ***** */
    /* *****                                    ***** */    

    const [allMessagesOnChatroom, setAllMessagesOnChatroom] = React.useState<interfaces.iMessage[]>([]);

    React.useEffect(() => {
        scrollMessages();
    }, [allMessagesOnChatroom])

    // Display all messages on precise channelChannel
    const displayChatroomMessages = () => {
        const messages = allMessagesOnChatroom?.map((message:interfaces.iMessage) =>
        {
            const blockedIds:number[] = [];
            for (const elem of userLogged.blockedUsers)
                blockedIds.push(elem.blockedUser.id);

            if (blockedIds.includes(message.author.id) === true)
                return (null)
            return (
            <div
                key={message.id}
                className='bg-slate-950 rounded-2xl mt-2 p-1 w-auto flex' >
                    <img className="w-10 h-10 m-1 mr-2 rounded-full object-cover opacity-100 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-rose-900" src={'http://localhost:3001/user/picture/' + (message.author.avatarURI !== undefined ? message.author.avatarURI : "avatar.png")} alt={message.author.avatarURI}></img>
                    <div className='flex flex-col'>
                        <div className='flex flex-row'>
                            <div className={`font-bold pr-2 ${userLogged.id === message.author.id ? "text-purple-500" : "text-orange-400" } `}> {message.author.nickname} </div>
                            <div className='opacity-50 text-xs p-1' > {interfaces.formatDate(message.posted_at)} </div>
                        </div>
                        <div id='message'>
                            {message.content}
                        </div>
                    </div>
                </div>
            )
        });
        return messages;
    }

    // Save and send writed message on ENTER press

    async function postMessage(content:string){
        const messageToSave = {
            content: content,
            authorId: userLogged.id,
            chatroomId: openedChatroom.id
        }
        if (userChatroom &&( userChatroom?.is_muted === true || userChatroom?.is_banned === true))
        {
            const currentDate = new Date();
            const muted_time:Date = new Date(userChatroom.muted_timer);
            const difference = (Math.abs(currentDate.getTime()) - muted_time.getTime())
            if (difference <= (5 * 60 * 1000))
                return ;
        }
        await api.post("/message", messageToSave).then(res=>{
            userSocket?.emit('sendNewMessage', res.data);
        }).catch(err => {})
    }

    const enterKeyCheckUp = (e:any) => {
        if (e.keyCode === 13)
        {
            if (message.length < 2)
            {
                setMessage("");
                scrollMessages();
                return ;
            }
            if (message.length >= 1026)
                return ;
            postMessage(message);
            scrollMessages();
            setMessage("");
            return ;
        }
    };

    // Change TextColor on TextArea depend on size
    const enterKeyCheckDown = (e:any) => {
        var element = document.getElementById("textarea");
        if (message.length < 1000)
        {    
            if (element)
                handleTextAreaColor("text-white");
            return ;
        }
        if (message.length > 1000 && message.length < 1024)
        {
            if (element)
                handleTextAreaColor("text-orange-500");
            return ;
        }
        if (message.length >= 1024)
        {
            if (element)
                handleTextAreaColor("text-red-500");
            return ;
        }
    };

    // Reset Message writed
    const [message, setMessage] = React.useState("");
    const handleChange = (event:any) => {
        setMessage(event.target.value);
    };


    /* *****                               ***** */
    /* *****       dislayOpenedChat        ***** */
    /* *****                               ***** */

    // Display Channel Members with colors and sort by importance
    const displayChat = () => {
        return (
            <div id="ActualChannel" className="h-[99%] m-2 flex flex-col items-center rounded-2xl bg-slate-950 bg-opacity-40 border-red-500 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-red-500">
                <div id="displayMessages" className={`h-[80%] w-[98%] overflow-auto`}>
                    {userChatroom?.is_banned === true ? <p className='justify-center items-center flex flex-col h-[100%]'>You are banned from this channel!</p>
                        : displayChatroomMessages()}
                    <div id='toScroll'></div>
                </div>
                <div id="writeMessage" className='rounded-2xl w-[98%] h-[16%] mt-4 p-2 bg-slate-950'>
                    <textarea
                    id="textarea"
                    className={`bg-transparent border-hidden w-[100%] h-[100%] hover:border-hidden ${textAreaColor}`}
                    spellCheck="true"
                    placeholder='Enter your message here.'
                    onKeyUp={enterKeyCheckUp}
                    onKeyDown={enterKeyCheckDown}
                    onChange={handleChange}
                    value={message}
                    maxLength={1024}
                    >
                    </textarea>
                </div>
            </div>
        );
    };

    
    /* *****                                ***** */
    /* *****       AllDivOnTheCenter        ***** */
    /* *****                                ***** */

    // Display Central Div
    var displayCentralDiv = () =>
        <div id="chatDiv" className="w-[80%] md:w-[60%] py-5 ">
            <div className='h-[100%] w-[100%] '>
                {centralDivState === ""  ? null : 
                centralDivState === "create" ? displayCreateChannelForm() : 
                centralDivState === "manage" ? displayManageChannelForm() : 
                centralDivState === "chat" ? displayChat() : undefined}
            </div>
        </div>
    ;


































/* ****************************************                                              **************************************** */
/* ****************************************                displayInfolDiv               **************************************** */
/* ****************************************                                              **************************************** */


    /* *****                                ***** */
    /* *****       UPDATE USERCHATROOM      ***** */
    /* *****                                ***** */

    async function promoteDemote(userChatroom:interfaces.iUserChatroom, option:string){
        let newUserChatroom = {is_owner: false,is_admin: false,is_muted: false,is_banned: false};
        newUserChatroom.is_banned = userChatroom.is_banned;
        newUserChatroom.is_muted = userChatroom.is_muted;
        newUserChatroom.is_owner = userChatroom.is_owner;
        if (option === "promote")
            newUserChatroom.is_admin = true;
        else if (option === "demote")
            newUserChatroom.is_admin = false;
        else
            return ;
        await api.put("http://localhost:3001/userChatroom/" + userChatroom.id, newUserChatroom).then(res=>{
            userSocket?.emit('promoteOrDemoteUser', activeChat);
        }).catch(err => {});
    }

    function isUserBlocked(userIdBlocked:number, userIdBy:number)
    {
        if (!userLogged.blockedUsers)
            return;
        for (const elem of userLogged.blockedUsers)
        {
            if (elem.blockedUser.id === userIdBlocked)
                return true
        }
        return false
    }

    async function blockUnblockUser(user:interfaces.iUser)
    {
        let isBlocked = isUserBlocked(user.id, userLogged.id);
        if (isBlocked === true)
            await api.delete("http://localhost:3001/block/deleteFromUsers/" + userLogged.id + "/" + user.id).then(res=>{
            }).catch(err => {})
        else if (isBlocked === false)
            await api.post("http://localhost:3001/block", {blocking_user_id: userLogged.id, blocked_user_id: user.id}).then(res=>{
            }).catch(err => {})
        handleOpenChatroomInfosMenu(undefined);
        dispatch(fetchUserProfile({username:userLogged.login42, token:token}));
    }

    async function blockUnblockUserDirectMessage(user:interfaces.iUser, option:string)
    {
        let isBlocked = isUserBlocked(user.id, userLogged.id);
        if (isBlocked === true && option === "unblock")
            await api.delete("http://localhost:3001/block/deleteFromUsers/" + userLogged.id + "/" + user.id).then(res=>{
            }).catch(err => {})
        else if (isBlocked === false && option === "block")
            await api.post("http://localhost:3001/block", {blocking_user_id: userLogged.id, blocked_user_id: user.id}).then(res=>{
            }).catch(err => {})
        handleOpenChatroomInfosMenu(undefined);
        dispatch(fetchUserProfile({username:userLogged.login42, token:token}));
    }

    async function banUser(user: interfaces.iUserChatroom)
    {
        let newUserChatroom = {is_owner: false,is_admin: false,is_muted: false,is_banned: true};
        await api.get("http://localhost:3001/userChatroom/getUserChatroom/" + userLogged?.id + "/" + activeChat).then(res => {
                setUserChatroom(res.data);
            }).catch(err => {})
        if (userChatroom?.is_admin === false && userChatroom?.is_owner === false)
            return ;
        await api.put("http://localhost:3001/userChatroom/" + user.id, newUserChatroom).then(res => {
            userSocket?.emit('makeUserLeaveChat', activeChat, user.user.id);
        }).catch(err => {})
        handleOpenChatroomInfosMenu(undefined);
    }

    async function muteUser(chatroom:interfaces.iUserChatroom)
    {
        await api.get("http://localhost:3001/userChatroom/getUserChatroom/" + userLogged?.id + "/" + activeChat).then(res => {
                setUserChatroom(res.data);
            }).catch(err => {})
        if (userChatroom?.is_admin === false && userChatroom?.is_owner === false)
            return ;
        await api.put("http://localhost:3001/userChatroom/" + chatroom.id, {is_muted: true, muted_timer:new Date()}).then(() => {
            userSocket?.emit('muteUser', activeChat, chatroom.user.id);
        }).catch(err => {})
        handleOpenChatroomInfosMenu(undefined);
    }

    async function leaveChannel(user: interfaces.iUserChatroom)
    {
        await api.delete('/userChatroom/' + user.id).then((res) => {
            userSocket?.emit('makeUserLeaveChat', activeChat, user?.user.id);
            handleOpenChatroom(chatroomTest);
            handleCentralDivState("");
        }).catch(err => {});
    }

    async function kickUser(user: interfaces.iUserChatroom)
    {
        await api.get("http://localhost:3001/userChatroom/getUserChatroom/" + userLogged?.id + "/" + activeChat).then(res => {
                setUserChatroom(res.data);
            }).catch(err => {})
        if (userChatroom?.is_admin === false && userChatroom?.is_owner === false)
            return ;
        await api.delete('/userChatroom/' + user.id).then(() => {
            userSocket?.emit('makeUserLeaveChat', activeChat, user.user.id);
        }).catch(err => {});
    }
    /* *****                                ***** */
    /* *****       displayUserInfo          ***** */
    /* *****                                ***** */

    // Display UserInfo
    const displayUserInfo = () =>
        <div className={`rounded-2xl m-3 p-2 w-[100%] h-[100%] flex flex-col items-center justify-center font-bold`}>
            <img className="hidden md:inline-flex  md:w-[100px] md:h-[100px] lg:w-[150px] lg:h-[150px] object-cover" style={{ borderRadius: 300/ 2}} src={'http://localhost:3001/user/picture/' + (UserOpenToSpeak?.avatarURI !== undefined ? UserOpenToSpeak?.avatarURI : "avatar.png")} alt={UserOpenToSpeak?.avatarURI}></img>
            <div className='  text-base lg:text-xl m-3'>{UserOpenToSpeak?.nickname} </div>
            <button className='rounded-lg bg-slate-950 m-2 p-2 text-sm lg:text-base w-[70%] font-bold ' onClick={()=>navigate('/profile/?user=' + UserOpenToSpeak?.login42)}>View Profile</button>
            <button className='rounded-lg bg-orange-400 font-bold bg-opacity-100 m-2 p-2 text-sm lg:text-base w-[70%]' onClick={()=>askToPlay(false, userLogged.id, UserOpenToSpeak?.id)}>Invite To Classic Mode</button>
            <button className='rounded-lg bg-purple-400 font-bold bg-opacity-100 m-2 p-2 text-sm lg:text-base w-[70%]' onClick={()=>askToPlay(true, userLogged.id, UserOpenToSpeak?.id)}>Invite To Power Up Mode</button>
            <button onClick={()=>blockUnblockUserDirectMessage(UserOpenToSpeak, "block")} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>Block</button>
            <button onClick={()=>blockUnblockUserDirectMessage(UserOpenToSpeak, "unblock")} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>Unblock</button>
        </div>
    ;



    /* *****                                     ***** */
    /* *****       displayChanelMembers          ***** */
    /* *****                                     ***** */

    const [openChatroomInfosMenuState, setOpenChatroomInfosMenu] = React.useState<interfaces.iUserChatroom|undefined>(undefined);
    function handleOpenChatroomInfosMenu(user:interfaces.iUserChatroom|undefined) {
        if (openChatroomInfosMenuState === user)
        {
            setOpenChatroomInfosMenu(undefined);
            return ;
        }
        setOpenChatroomInfosMenu(user);
    }

    function canIModify(userLogged:interfaces.iUserChatroom|undefined, userDisplayed:interfaces.iUserChatroom){
        if (userLogged?.is_owner === true) //member connected is owner
            return true
        if (userLogged?.is_admin === false && userLogged?.is_owner === false) //member connected is member
            return false
        if (userLogged?.is_admin === true && (userDisplayed.is_admin === false && userDisplayed.is_owner === false)) //member connected is admin and other member
            return true
        if (userLogged?.is_admin === true && userDisplayed.is_admin === true) //member connected is admin and other admin
            return false
        if (userLogged?.is_admin === true && userDisplayed.is_owner === true) //member connected is admin and other owner
            return false
        return true
    }

    const openChatroomInfosMenu = (userChatroom:interfaces.iUserChatroom|undefined) => {
        if (userChatroom === undefined)
            return (<div className='hidden'></div>)
        return (
        <div className='flex flex-col bg-slate-950 items-center rounded-lg p-2 gap-1'>
            
            {/* User Option */}
            <button onClick={()=>navigate('/profile/?user=' + userChatroom.user.login42)} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>View Profile</button>
            <button onClick={()=>askToPlay(false, userLogged.id, userChatroom.user.id)} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>Invite in Classic Mode</button>
            <button onClick={()=>askToPlay(true, userLogged.id, userChatroom.user.id)} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>Invite in Power Up Mode</button>
            <button onClick={()=>blockUnblockUser(userChatroom.user)} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>{isUserBlocked(userChatroom.user.id, userLogged.id) === false ? "Block" : "Unblock" }</button>

            {/* Administrator Option */}
            {canIModify(userChatroomOfLoggedUser, userChatroom) === true ? <span className='border-slate-800 w-[50%] rounded-lg border-b-2'></span> : undefined}
            {canIModify(userChatroomOfLoggedUser, userChatroom) === true ? <button onClick={() => kickUser(userChatroom)} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>Kick</button> : undefined}
            {canIModify(userChatroomOfLoggedUser, userChatroom) === true ? <button onClick={() => banUser(userChatroom)} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>Ban</button> : undefined}
            {canIModify(userChatroomOfLoggedUser, userChatroom) === true ? <button onClick={() => muteUser(userChatroom)} className='hover:bg-slate-800 w-[100%] rounded-lg p-1'>Mute</button> : undefined}

            {/* Owner Option */}
            {canIModify(userChatroomOfLoggedUser, userChatroom) === true && userChatroomOfLoggedUser?.is_owner === true ? <span className='border-slate-800 w-[50%] rounded-lg border-b-2'></span> : undefined}
            {canIModify(userChatroomOfLoggedUser, userChatroom) === true && userChatroomOfLoggedUser?.is_owner === true ? <button onClick={() => promoteDemote(userChatroom, "promote")} className={`hover:bg-slate-800 w-[100%] rounded-lg p-1 ${userChatroom.is_admin ? " hidden " : null}`}>Promote</button> : undefined}
            {canIModify(userChatroomOfLoggedUser, userChatroom) === true && userChatroomOfLoggedUser?.is_owner === true ? <button onClick={() => promoteDemote(userChatroom, "demote")} className={`hover:bg-slate-800 w-[100%] rounded-lg p-1 ${userChatroom.is_admin === false ? " hidden " : null}`}>Demote</button> : undefined}
        </div>)
    }

    const [activeChannelUsers, setActiveChannelUsers] = React.useState<interfaces.iUserChatroom[]>([]);
    async function handleActiveChannelUsers(chatroomId:number){
        await api.get("http://localhost:3001/chatroom/getAllUsersFromChatroomId/" + chatroomId).then(res => {
            setActiveChannelUsers(res.data);
        }).catch(err => {})
    }

    // Display Channel Members with colors and sort by importance
    function displayChanelMembers() {
        let administratorsNumber = 0;
        let membersNumber = 0;
        if (Array.isArray(activeChannelUsers) === false)
            return (null)

        activeChannelUsers?.forEach((userChatroom) =>
        {
            if (userChatroom.is_owner === false && userChatroom.is_admin === true && userChatroom.is_banned === false)
                administratorsNumber += 1;
            else if (userChatroom.is_owner === false && userChatroom.is_admin === false && userChatroom.is_banned === false)
                membersNumber+=1;
        });


        const ownerUsers = activeChannelUsers?.map((userChatroom) => {
            if (userChatroom === null || userChatroom.user === null)
                return null;
            return (
                <div className='flex flex-col h-auto w-[95%]' key={userChatroom.id}>
                    <button 
                    onClick={() => handleOpenChatroomInfosMenu(userChatroom)}
                    className={`${ userChatroom.is_owner === true ? "h-auto w-[95%] flex mt-1 py-2 ml-2 mr-2 rounded-xl items-center text-red-400 font-bold lg:text-base md:text-sm" : ""}`}>    
                        {userChatroom.is_owner === true ? <img className="w-10 h-10 ml-2 mr-3 opacity-100 object-cover rounded-full" src={'http://localhost:3001/user/picture/' + (userChatroom.user.avatarURI !== undefined ? userChatroom.user.avatarURI : "avatar.png")} alt={userChatroom.user.avatarURI}></img> : ""}
                        {userChatroom.is_owner === true ? userChatroom.user.nickname : ""}
                    </button>
                    {(userChatroom.is_owner === true) && openChatroomInfosMenuState === userChatroom && userLogged.id !== openChatroomInfosMenuState.user.id ? openChatroomInfosMenu(userChatroom) : undefined}
                </div>
            )
        });


        const administratorUsers = activeChannelUsers?.map((userChatroom) =>
        {
            if (userChatroom === null || userChatroom.user === null)
                return null;
            return (
                <div className='flex flex-col h-auto w-[95%]' key={userChatroom.id}>
                    <button 
                    onClick={() => handleOpenChatroomInfosMenu(userChatroom)}
                    className={`${ userChatroom.is_admin === true ? "h-auto w-[95%]  flex mt-1 py-2 ml-2 mr-2 rounded-xl items-center text-yellow-500 font-bold lg:text-base md:text-sm" : ""}`}
                    >    
                        {userChatroom.is_admin === true ? <img className="w-10 h-10 ml-2 mr-3 opacity-100 object-cover rounded-full" src={'http://localhost:3001/user/picture/' + (userChatroom.user.avatarURI !== undefined ? userChatroom.user.avatarURI : "avatar.png")} alt={userChatroom.user.avatarURI}></img> : ""}
                        {userChatroom.is_admin === true ? userChatroom.user.nickname : ""}
                    </button>
                    {(userChatroom.is_admin === true) && openChatroomInfosMenuState === userChatroom && userLogged.id !== openChatroomInfosMenuState.user.id ? openChatroomInfosMenu(userChatroom) : undefined}
                </div>
            )
        });


        const memberUsers = activeChannelUsers?.map((userChatroom) =>
        {
            if (userChatroom === null || userChatroom.user === null)
                return null;
            return (
                <div className='flex flex-col h-auto w-[95%]' key={userChatroom.id}>
                    <button 
                    onClick={() => handleOpenChatroomInfosMenu(userChatroom)}
                    className={`${(userChatroom.is_owner === false && userChatroom.is_admin === false && userChatroom.is_banned === false) ? "h-auto w-[95%]  flex mt-1 py-2 ml-2 mr-2 rounded-xl items-center font-bold lg:text-base md:text-sm" : undefined }`}
                    >    
                        {(userChatroom.is_owner === false && userChatroom.is_admin === false && userChatroom.is_banned === false) ? <img className="w-10 h-10 ml-2 mr-3 opacity-100 object-cover rounded-full" src={'http://localhost:3001/user/picture/' + (userChatroom.user.avatarURI !== undefined ? userChatroom.user.avatarURI : "avatar.png")} alt={userChatroom.user.avatarURI}></img> : undefined}
                        {(userChatroom.is_owner === false && userChatroom.is_admin === false && userChatroom.is_banned === false) ? userChatroom.user.nickname  : undefined }
                    </button>
                    {(userChatroom.is_owner === false && userChatroom.is_admin === false && userChatroom.is_banned === false) && openChatroomInfosMenuState === userChatroom && userLogged.id !== openChatroomInfosMenuState.user.id ? openChatroomInfosMenu(userChatroom) : undefined}
                </div>
            )
        });

        return (
            <div id='scrollbar' className='w-[100%] h-[98%] flex flex-col justify-center items-center text-sm lg:text-base font-bold'>
                <div id='scrollbar' className='flex flex-col w-[100%] h-[95%] overflow-auto'>
                    <div id='scrollbar' className='flex flex-col items-center '>
                        <div className={`mt-5 ml-5 font-extrabold`}>Owner</div>
                        {ownerUsers}
                        <div className={`mt-5 ml-5 font-extrabold ${administratorsNumber === 0 ? "hidden" : ""}`}>Administrators</div>
                        {administratorUsers}
                        <div className={`mt-5 ml-5 font-extrabold ${membersNumber === 0 ? "hidden" : ""}`}>Members</div>
                        {memberUsers}
                    </div>
                </div>
                <div className='font-bold mt-2 flex justify-center flex-col w-[70%] gap-y-3'>
                    {userChatroom?.is_owner === true ?
                    <button onClick={handleManageChannelButton} className='flex flex-row justify-center items-center bg-orange-400 rounded-lg p-2'>
                        <p>Manage Channel</p>
                        <p className={`${centralDivState === "manage"  ? "text-slate-950" : "text-slate-800" } font-bold fa-solid fa-gear ml-2`}></p>
                    </button>: null }
                    <button className='flex flex-row justify-center items-center bg-purple-400 rounded-lg p-2' onClick={() => leaveChannel(userChatroom)}>
                        <p>Leave Channel</p>
                        <p className="text-white font-bold fa-solid fa-right-from-bracket ml-2"></p>
                    </button>
                </div>
            </div>
        );
    };
        


    /* *****                                ***** */
    /* *****       AllDivOnTheRight         ***** */
    /* *****                                ***** */

    // Display Info Div
    var displayInfoDiv = () =>
        <div id="infoDiv" className="w-[20%] py-5 hidden md:block"> 
            <div id="scrollbar" className="h-[99%] m-2 bg-slate-950 bg-opacity-40 flex flex-col items-center border-2 rounded-2xl border-orange-900 shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-orange-900">
                { openedChatroom.id !== 0 ? openedChatroom.type !== "DM" ? displayChanelMembers() : openedChatroom.type === "DM" ? displayUserInfo() : null : null}
            </div>  
        </div>
    ;































/* ****************************************                                                **************************************** */
/* ****************************************                Entierty of the page               **************************************** */
/* ****************************************                                                **************************************** */


   // Entierty of the page
   return (
    <div id="pageBody" className="h-[100%] w-[100%] flex flex-col overflow-auto bg-slate-900">
        <NavBar />
        <div id="ChatBody" className="flex items-stretch pt-16 h-[100%]">
            {displayFriendsChannelsList()}
            {displayCentralDiv()}
            {displayInfoDiv()}
        </div>
    </div>
    );
};

export default Chat;