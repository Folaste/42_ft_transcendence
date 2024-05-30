import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GeneralUpdateService } from './general-update.service';
import { Server, Socket } from 'socket.io';

interface iUser {
  id: number,
  login42: string,
  nickname: string,
  avatarURI: string,
  email: string,
}

@WebSocketGateway({   
  cors: { origin: ['http://localhost:3000']},
  namespace: '/general'
})

@WebSocketGateway()
export class GeneralUpdateGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly generalUpdateService: GeneralUpdateService){}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket)
  { 
    client.data = {
      id : -1,
      status : 'connected',
    }

    this.generalUpdateService.addUser(client);
  }

  @SubscribeMessage('getAllUsersStatus')
  getAllUsersStatus(client : Socket, users:{ id: number; user: iUser; }[])
  {
    const allUsersStatus : {id:number, status:string}[] = this.generalUpdateService.getAllUsersStatus(users);
    this.server.to(client.id).emit('allUsersStatus', allUsersStatus);
  }

  @SubscribeMessage('getUserStatus')
  getUserStatus(client : Socket, data:any[])
  {
    const id:number = data[0];
    const option:boolean = data[1];
    const userStatus : string = this.generalUpdateService.getAUserStatus(id);
    if (option === true)
      this.server.to(client.id).emit('userStatusOption', userStatus);
    else
      this.server.to(client.id).emit('userStatus', userStatus);
  }

  @SubscribeMessage('changeUserStatus')
  changeUserStatus(client : Socket, status : string)
  {
    client.data.status = status;
    client.broadcast.emit('statusChangement', client.data.id, client.data.status);
  }

  @SubscribeMessage('preventDBChangement')
  preventChangement(client : Socket)
  {
    client.broadcast.emit('DBChangement', client.data.id);
  }

  @SubscribeMessage('setUserId')
  setUserId(client : Socket, id : number)
  {
    client.data.id = id;
  }

  @SubscribeMessage('unsetUserId')
  unsetUserId(client : Socket)
  {
    client.data.id = -1;
  }

  @SubscribeMessage('inviteToPlay')
  inviteToPlay(client : Socket, data: any[])
  {
    const askerId: number = data[0];
    const askerUsername: string = data[1];
    const receiverId: number = data[2];
    const upOrNot: boolean = data[3];
    
    const socketOpponent = this.generalUpdateService.getUserSocket(receiverId);
    if (socketOpponent?.id)
    {
      this.server.to(client.id).emit('opponentConnect', receiverId, upOrNot);
      this.server.to(socketOpponent.id).emit('receivePlayRequest', askerId, askerUsername, upOrNot);
    }
    else
      this.server.to(client.id).emit('userStatusOption', 'disconnected');
  }

  @SubscribeMessage('beMyFriend')
  beMyFriend(client: Socket, data: any[])
  {
    const askerId: number = data[0];
    const askerUsername: string = data[1];
    const receiverId: number = data[2];
    
    const socketFriend = this.generalUpdateService.getUserSocket(receiverId);
    if (socketFriend?.id)
      this.server.to(socketFriend.id).emit('receiveFriendRequest', askerId, askerUsername);
  }

  @SubscribeMessage('addNewFriend')
  addNewFriend(client: Socket, friendId: number)
  {
    const friendSocket = this.generalUpdateService.getUserSocket(friendId);
    if (friendSocket?.id)
      this.server.to(friendSocket.id).emit('RequestAccepted', client.data.id);
    this.server.to(client.id).emit('newFriendAccepted');
  }

  @SubscribeMessage('friendDelete')
  friendDelete(client: Socket, friendId:number)
  {
    const friendSocket = this.generalUpdateService.getUserSocket(friendId);
    if (friendSocket?.id)
      this.server.to(friendSocket.id).emit('friendDeleted');
  }

  handleDisconnect(client: Socket)
  {
    this.server.emit('statusChangement', client.data.id, 'disconnected');
    client.data.id = -1;
    this.generalUpdateService.deleteUser(client);
  }
}
