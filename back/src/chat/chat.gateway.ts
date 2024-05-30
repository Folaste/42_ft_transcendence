import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect,} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface iChatroom {
  id: number,
  name: string,
  hashed_pwd: string,
  type: string,
  messages:iMessage[],
  userChatroom: iUserChatroom[]
}

interface iUserChatroom {
  id: number,
  is_owner: boolean,
  is_admin: boolean,
  is_muted: boolean,
  is_banned: boolean,
  user: iUser,
  chatroom: iChatroom,
}

interface iUser {
  id: number,
  login42: string,
  nickname: string,
  avatarURI: string,
  email: string,
  auth2F: boolean,
  userChatroom: iUserChatroom[],
  messages: iMessage[],
}

interface iMessage {
  id: number,
  content: string,
  posted_at: Date,
  author: iUser,
  chatroom: iChatroom,
}


@WebSocketGateway({   
  cors: { origin: ['http://localhost:3000']},
  namespace: '/chat'
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect
{ 
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService){}

  handleConnection(client: Socket)
  {
    client.data = {
      userId: -1,
      oldChat: -1,
    }
    
    this.chatService.addUser(client);
  }

  handleDisconnect(client: Socket)
  {
    client.data.userId = -1; 
    this.chatService.deleteUser(client);
    if (client.data.oldChat !== -1)
      client.leave(client.data.oldChat.toString());
  }

  /*
    Allow the socket to know the userId of the socket owner
    And an emit right after the socket is created in the chat front
  */
  @SubscribeMessage('setUserId')
  setUserId(client:Socket, userId:string)
  {
    client.data.userId = userId;
  }

  // Allow user to send message to a specific recipient (Chat or User)
  @SubscribeMessage('sendNewMessage')
  sendNewMessage(client:Socket, data:iMessage)
  {
    const recipient : number = data.chatroom.id;

    // Send the message to the recipient
    this.server.to(recipient.toString()).emit('getNewMessage', data);
  }

  // Allow user to join a Chat
  @SubscribeMessage('joinAChat')
  joinChat(client : Socket, chatid:number)
  {
    if (client.data.oldChat !== -1)
      client.leave(client.data.oldChat.toString());

    client.data.oldChat = chatid;
    client.join(chatid.toString());
  }

  // Make a user leave a specific Channel
  @SubscribeMessage('makeUserLeaveChat')
  bannedUser(client : Socket, data:any[])
  {
    const chatId = data[0];
    const bannedUserId = data[1];

    const bannedUserSocket = this.chatService.getUserSocket(bannedUserId);

    this.server.to(bannedUserSocket.id).emit('UserLeftChannel', chatId);
    this.server.to(chatId.toString()).emit('updateActiveChannel', chatId);
    if (bannedUserSocket.data.oldChat === chatId)
        bannedUserSocket.leave(bannedUserSocket.data.oldChat.toString());
  }

  @SubscribeMessage('promoteOrDemoteUser')
  promoteOrDemoteUser(client: Socket, chatId:number)
  {
    this.server.to(chatId.toString()).emit('updateActiveChannel', chatId);
  }

  @SubscribeMessage('updateUsersChan')
  updateUsersChan(client: Socket, chatId:number)
  {
    this.server.to(chatId.toString()).emit('updateActiveChannel', chatId);
  }

  @SubscribeMessage('muteUser')
  userGotMuted(client: Socket, data:any)
  {
    const chatId = data[0];
    const bannedUserId = data[1];

    const muteUserSocket = this.chatService.getUserSocket(bannedUserId);
    if (muteUserSocket)
      this.server.to(muteUserSocket.id).emit('updateActiveChannel', chatId);
  }
}