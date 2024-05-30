import { useContext, useEffect, useRef, useState } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Profile } from './components/pages/Profile';
import Home from './components/pages/Home';
import { Game } from './components/pages/Game';
import { Leaderboard } from './components/pages/Leaderboard';
import Private from './components/utils/Private';
import ErrorPage from './components/utils/ErrorPage';
import './index.css'
import {useSelector } from 'react-redux';
import { selectDatas, selectStatus } from './stores/selector';
import { Hub } from './components/pages/Hub';
import { TwoFactor } from './components/pages/TwoFactor';
import Settings from './components/pages/Setting';
import { SocketContext } from './context/SocketContext';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Friends from './components/pages/Friends';
import Chat from './components/pages/Chat';
import api from './api/axios';

function App() {
  const status = useSelector(selectStatus);
  const socket = useContext(SocketContext);
  const data = useSelector(selectDatas);

  const [friendRequest, setFriendRequest] = useState(false);
  const [playRequest, setPlayRequest] = useState(false);
  const [notConnected, setNotConnected] = useState(false);
  const requestRef = useRef({
    askerId: -1,
    receiverId: -1,
    upOrNot: false
  })

  useEffect(() =>
    {
      if (status === true)
      {
        socket.emit('setUserId', data.id);
        socket.emit('changeUserStatus', 'connected');
      }
    }
  , [status]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit('changeUserStatus', 'disconnected');
      socket.disconnect();
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);

    //receive friend request notification
    socket.on('receiveFriendRequest', (askerId: number, askerUsername: string) => {
      toast(`${askerUsername} wants to become your friend !`);
      requestRef.current.askerId = askerId;
      setFriendRequest(true);
    });
    
    //receive play request notification
    socket.on('receivePlayRequest', (askerId: number, askerUsername: string, upOrNot: boolean) => {
      toast(`${askerUsername} wants to play with you${upOrNot ? ', with powerups' : ''} !`);
      requestRef.current.askerId = askerId;
      requestRef.current.upOrNot = upOrNot;
      setPlayRequest(true);
    });

    socket.on('userStatusOption', (userStatus: string) => {
      if (userStatus === 'disconnected')
      { 
        toast(`This user is not connected now, try again later`);
        setNotConnected(true);
      }
    });

    return () => {
      socket.off('receiveFriendRequest');
      socket.off('receivePlayRequest');
      socket.off('userStatusOption');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket]);

  useEffect(() => {
    const handlePageShow = (event : any) => {
      if (event.persisted) {
        if (!socket.connected) {
          socket.connect();
          socket.emit('setUserId', data.id);
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () =>{
      window.removeEventListener('pageshow', handlePageShow);
      socket.disconnect();
    };
  }, []);

  const handleAcceptFriendRequest = (closeToast: any) => {
    closeToast();
    setFriendRequest(false);
    api.post("/friend", {idLeft: requestRef.current.askerId, idRight: data.id}).then
        (
          () => { 
            closeToast();
            socket.emit('addNewFriend', requestRef.current.askerId);
          }
        ).catch
        (
            err => {
                console.log(err);
            }
        )
  }

  const handleAcceptPlayRequest = (closeToast: any) => {
    window.history.pushState({
      opponentId: requestRef.current.askerId,
      upOrNot: requestRef.current.upOrNot
    }, '', '/game');
    window.location.href = '/game';
    
    closeToast();
    setPlayRequest(false);
  }

  return (
      <div className="h-screen dark:bg-gradient-to-b from-slate-950 to-blue-950 dark:text-white font-poppins ">
        <Router>
            <SocketContext.Provider value={socket}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route element={<Private/>}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/game" element={<Game/>} />
                  <Route path="/leaderboard" element={<Leaderboard/>} />
                  <Route path="/chat" element={<Chat/>} />
                  <Route path="/hub" element={<Hub/>} />
                  <Route path="/settings" element={<Settings/>} />
                  <Route path="/friends" element={<Friends/>} />
                </Route>
                <Route path="/twofactor" element={<TwoFactor/>} />
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </SocketContext.Provider>
        </Router>
        { friendRequest ? < ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastClassName="flex border-2 border-purple-700 shadow-[0_0px_7px_0px_rgb(0,0,0,0.3)] shadow-purple-600 text-white text-left border-lg"
                theme = 'dark'
                closeButton = {({closeToast}) => (
                  <button className = "mt-5 mb-5 pl-5 pr-5 pt-3 pb-3 rounded-md bg-purple-400 text-gray-800 text-center font-medium" onClick={() => handleAcceptFriendRequest(closeToast)}>Accept</button>
                )}
        /> : null}

        { playRequest ? < ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastClassName="flex border-2 border-purple-700 shadow-[0_0px_7px_0px_rgb(0,0,0,0.3)] shadow-purple-600 text-white text-left border-lg"
                theme = 'dark'
                closeButton = {({closeToast}) => (
                  <button className = "mt-5 mb-5 pl-5 pr-5 pt-3 pb-3 rounded-md bg-purple-400 text-gray-800 text-center font-medium" onClick={() => handleAcceptPlayRequest(closeToast)}>Accept</button>
                )}
        /> : null}
        {
          notConnected ? < ToastContainer 
          position="top-center"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastClassName="flex border-2 border-purple-700 shadow-[0_0px_7px_0px_rgb(0,0,0,0.3)] shadow-purple-600 text-white text-left border-lg"
          theme = 'dark'
          /> : null}
      </div>
  );
}

export default App;