import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect,} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({   
    cors: { origin: ['http://localhost:3000']},
    namespace: '/game'
})

export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{
    // for each roomId there is a different instance of GameService
    private games: { [roomId:string]:GameService | null} = {};
    private clientsOnMatchMaking : Socket[] = [];
    private clientsOnMatchMakingWithUp : Socket[] = [];
    private clientsInviteOnMatchMaking : Socket[] = [];

    constructor(private readonly gameService: GameService){}

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket)
    {
        client.data = {
            userId : -1,
            username : "",
            position : "",
            roomId : "-1",
            userInviteId : -1,
            up : false,
        }
    }

    handleDisconnect(client: Socket)
    {
        let indexClientOnMatchMaking : number;

        if (client.data.up && client.data.userInviteId === -1)
            indexClientOnMatchMaking = this.clientsOnMatchMakingWithUp.indexOf(client);
        else if (!client.data.up && client.data.userInviteId === -1)
            indexClientOnMatchMaking = this.clientsOnMatchMaking.indexOf(client);
        else if (client.data.userInviteId !== -1)
            indexClientOnMatchMaking = this.clientsInviteOnMatchMaking.indexOf(client);

        // If you weren't in game, quit matchmaking
        if (indexClientOnMatchMaking !== -1)
        {
            if (client.data.up && client.data.userInviteId === -1)
                this.clientsOnMatchMakingWithUp.splice(indexClientOnMatchMaking, 1);
            else if (!client.data.up && client.data.userInviteId === -1)
                this.clientsOnMatchMaking.splice(indexClientOnMatchMaking, 1);
            else if (client.data.userInviteId !== -1)
                this.clientsInviteOnMatchMaking.splice(indexClientOnMatchMaking, 1);
        }
        // Otherwise quit game
        else
        {
            client.to(client.data.roomId).emit('PlayerDisconnected');
            this.games[client.data.roomId]?.leaveRoom(client, client.data.roomId);
            if (this.games[client.data.roomId] && this.games[client.data.roomId].nbInRoom === 0)
            {
                delete this.games[client.data.roomId];
            }
        }
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, data : any[])
    {
        const powerUpOn : boolean = data[0];
        const username : string = data[1];
        const userId : number = data[2];
        const userInviteId : number = data[3];

        let sockets : (Socket | null)[] = [null, null];

        client.data.up = powerUpOn;
        client.data.userId = userId;
        client.data.username = username;
        client.data.userInviteId = userInviteId;

        // Put the client in the right matchMaking
        if (powerUpOn && client.data.userInviteId === -1)
        {
            this.clientsOnMatchMakingWithUp.push(client);
            sockets = this.gameService.thereIsAMatch(this.clientsOnMatchMakingWithUp);
        }
        else if (!powerUpOn && client.data.userInviteId === -1)
        {
            this.clientsOnMatchMaking.push(client);
            sockets = this.gameService.thereIsAMatch(this.clientsOnMatchMaking);
        }
        else if (client.data.userInviteId !== -1)
        {
            this.clientsInviteOnMatchMaking.push(client);
            sockets = this.gameService.findMyFriend(this.clientsInviteOnMatchMaking, client);
        }

        // If there is two clients in matchmaking, make a match and give them a room
        if (sockets[0] && sockets[1])
        {
            let clientLeft: Socket = sockets[0];
            let clientRight: Socket = sockets[1];

            clientLeft.data.position = 'left';
            clientRight.data.position = 'right';

            this.gameService.joinRoom(clientLeft, clientRight);

            this.games[clientLeft.data.roomId] = new GameService();
            this.games[clientLeft.data.roomId].nbInRoom = 2;

            this.server.to(clientLeft.id).emit('LeftPlayer', this.gameService.PlayerWidth, this.gameService.PlayerHeight, this.gameService.BallWidth, this.gameService.BallHeight, clientRight.data.username, clientRight.data.userId);
            this.server.to(clientRight.id).emit('RightPlayer', this.gameService.PlayerWidth, this.gameService.PlayerHeight, this.gameService.BallWidth, this.gameService.BallHeight, clientLeft.data.username, clientLeft.data.userId);
            this.server.to(clientLeft.data.roomId).emit('Letsgo');
        }
    }

    @SubscribeMessage('initBackGame')
    handleInitGame (client: Socket, data: any[])
    {
        this.games[client.data.roomId]?.initGame(client, data);
    }

    @SubscribeMessage('getGameInfos')
    handleGameInfos (client : Socket)
    {
        const {ballX, ballY, scoreLeft, scoreRight} = this.games[client.data.roomId]?.moveBall();

        this.server.to(client.data.roomId).emit('moveBall', ballX, ballY);
        this.server.to(client.data.roomId).emit('updateScore', scoreLeft, scoreRight);

        if (scoreLeft === 4 && scoreRight === 2)
            this.server.to(client.data.roomId).emit('JoyEasterEgg', true);

        else if ((scoreLeft === 5 && scoreRight === 2)
                || (scoreLeft === 4 && scoreRight === 3))
            this.server.to(client.data.roomId).emit('JoyEasterEgg', false);

        if (scoreLeft === 5)
            this.server.to(client.data.roomId).emit('endGame', 'left');
        else if (scoreRight === 5)
            this.server.to(client.data.roomId).emit('endGame', 'right');

        if (this.games[client.data.roomId].powerUp)
        {
            const upEvent:number = this.games[client.data.roomId]?.checkUp();

            switch (upEvent)
            {
                case 1:
                    let shiftX: number = Math.floor(Math.random() * 175) - 100;
                    let shiftY: number = Math.floor(Math.random() * 400) - 200;
                    this.games[client.data.roomId].setUpCoords(this.games[client.data.roomId].CanvasWidth/2 + shiftX, this.games[client.data.roomId].CanvasHeight/2 + shiftY);
                    this.server.to(client.data.roomId).emit('upAppear', this.games[client.data.roomId].PowerUpActivated, shiftX, shiftY, this.gameService.UpWidth, this.gameService.UpHeight);
                break;

                case 2:
                    this.server.to(client.data.roomId).emit('catchUp', this.games[client.data.roomId].LastPaddleTouched);
                    this.games[client.data.roomId].setUpCoords(-1, -1);
                break;

                case 3:
                    this.server.to(client.data.roomId).emit('clearUp');
                    this.games[client.data.roomId].setUpCoords(-1, -1);
                break;

                case 4:
                    this.server.to(client.data.roomId).emit('endUp');
                break;
            }
        }
    }

    @SubscribeMessage('gameUpdate')
    handlePlayerMove(client: Socket, newY:number)
    {
        this.games[client.data.roomId]?.udpatePlayerPosition(client, newY);
        client.to(client.data.roomId).emit('updateOpponent', newY);
    }
}