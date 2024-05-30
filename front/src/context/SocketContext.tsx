import React from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/general');

export const SocketContext = React.createContext(socket);