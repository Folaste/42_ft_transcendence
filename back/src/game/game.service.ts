import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface Element {
    x?: number,
    y?: number,
    width: number,
    height: number,
    middleY?:number,
}

interface Ball extends Element {
    xVec: number;
    yVec: number;
    speed: number;
}

@Injectable()
export class GameService
{
    private Canvas: Element = {width: 0, height: 0};
    private PlayerLeft: Element = {x: 0, y: 0, width: 12, height: 100};
    private PlayerRight: Element = {x: 0, y: 0, width: 12, height: 100};
    private Ball: Ball = {x: 0, y: 0, width: 12, height: 17, xVec: 0, yVec: 0, speed: 0};
    private Up : Element = {x: 0, y: 0, width: 50, height: 55}

    private roomId:number = 0;
    private playerLeftScore:number = 0;
    private playerRightScore:number = 0;

    public nbInRoom:number = 0;

    public powerUp = false;

    private lastDate:Date = new Date();
    private powerUpActivated: number = 0;
    private powerUpState: number = 0;
    private lastPaddleTouched: string = "";
    private disabledUp:boolean = false;

    // Room Logic

    joinRoom(client1: Socket, client2: Socket)
    {
        client1.join(this.roomId.toString());
        client2.join(this.roomId.toString());
        client1.data.roomId = this.roomId.toString();
        client2.data.roomId = this.roomId.toString();

        this.roomId++;
    }
    
    leaveRoom(client:Socket, roomId:string)
    {
        client.leave(roomId);
        this.nbInRoom--;
    }

    // MatchMaking Logic

    thereIsAMatch(matchMakingQueue : Socket[]) : (Socket | null)[]
    {
        let sockets : (Socket | null)[] = [null, null];

        if (matchMakingQueue.length === 1)
            return (sockets);

        sockets[0] = matchMakingQueue[0];
        
        for (const elem of matchMakingQueue)
        {
            if (elem.data.userId !== sockets[0].data.userId)
            {
                sockets[1] = elem;
                break ;
            }
        }

        if (sockets[0] && sockets[1])
        {
            matchMakingQueue.splice(matchMakingQueue.indexOf(sockets[0]), 1);
            matchMakingQueue.splice(matchMakingQueue.indexOf(sockets[1]), 1);
        }

        return (sockets);
    }

    findMyFriend(matchMakingInvite : Socket[], userSocket : Socket) : (Socket | null)[]
    {
        let sockets : (Socket | null)[] = [null, null];

        if (matchMakingInvite.length === 1)
            return (sockets);

        sockets[1] = userSocket;
        
        for (const elem of matchMakingInvite)
        {
            if (elem.data.userId === sockets[1].data.userInviteId && elem.data.up === sockets[1].data.up)
            {
                sockets[0] = elem;
                break ;
            }
        }

        if (sockets[0] && sockets[1])
        {
            matchMakingInvite.splice(matchMakingInvite.indexOf(sockets[0]), 1);
            matchMakingInvite.splice(matchMakingInvite.indexOf(sockets[1]), 1);
        }

        return (sockets);
    }

    // Game Logic

    initGame(client:Socket, data:any[])
    {
        this.playerLeftScore = 0;
        this.playerRightScore = 0;

        this.Canvas.width = data[0];
        this.Canvas.height = data[1];

        if (client.data.position === 'left')
        {
            this.PlayerLeft.middleY = this.PlayerLeft.height / 2;
            this.PlayerLeft.x = data[2];
            this.PlayerLeft.y = data[3];
        }

        if (client.data.position === 'right')
        {
            this.PlayerRight.middleY = this.PlayerRight.height / 2;
            this.PlayerRight.x = data[2];
            this.PlayerRight.y = data[3];
        }
        
        this.Ball.middleY = this.Ball.height / 2;
        this.Ball.x = data[4];
        this.Ball.y = data[5];
        this.Ball.speed = 2.5;

        this.powerUp = data[6];

        const randomDirection = Math.floor(Math.random() * 2);
        if (randomDirection === 1)
            this.Ball.xVec = 1;
        else
            this.Ball.xVec = -1;

        this.Ball.yVec = 1;
    }

    moveBall() : { ballX : number; ballY : number, scoreLeft:number, scoreRight:number}
    {
        const ballBottom = this.Ball.y + this.Ball.height;
        const paddleLeftBottom = this.PlayerLeft.y + this.PlayerLeft.height; 
        const paddleRightBottom = this.PlayerRight.y + this.PlayerRight.height;
        const date: Date = new Date();

        //top collision
        if (this.Ball.y <= 0)
            this.Ball.yVec = Math.random();

        //bottom collision
        if (this.Ball.y + this.Ball.height >= this.Canvas.height)
            this.Ball.yVec = -Math.random();

        //out of the bounds
        if (this.Ball.x <= 0 || this.Ball.x + this.Ball.width >= this.Canvas.width)
        {
            // Bound left
            if (this.Ball.x <= 0)
                this.playerRightScore++;
            // Bound right
            else if (this.Ball.x + this.Ball.width >= this.Canvas.width)
                this.playerLeftScore++;

            this.Ball.x = this.Canvas.width / 2 - this.Ball.width / 2;
            this.Ball.y = this.Canvas.height/2 - (this.Ball.height - 1) / 2;

            this.Ball.yVec = (Math.random() * 2) - 1;
            this.lastPaddleTouched = "";
        }

        //collision with left paddle (first player left)
        if (this.Ball.x <= this.PlayerLeft.x + this.PlayerLeft.width
            && ballBottom >= this.PlayerLeft.y && this.Ball.y <= paddleLeftBottom)
        {
            const ratio = 0.8 / this.PlayerLeft.middleY;
            let impactOnPaddle:number;

            // Ball middle hit outside LeftPaddle top
            if (this.Ball.y + this.Ball.middleY < this.PlayerLeft.y)
                impactOnPaddle = ballBottom - this.PlayerLeft.y;
            // Ball middle hit outside LeftPaddle bottom
            else if (this.Ball.y + this.Ball.middleY > paddleLeftBottom)
                impactOnPaddle = this.Ball.y - this.PlayerLeft.y;
            // Ball middle hit inside LeftPaddle
            else
                impactOnPaddle = (this.Ball.y + this.Ball.middleY) - this.PlayerLeft.y;
            
            this.Ball.yVec = ratio * (impactOnPaddle - this.PlayerLeft.middleY);
            this.Ball.xVec = 1;
            this.lastPaddleTouched = "left";

            if (this.powerUpActivated === 1 && date.getTime() - this.lastDate.getTime() >= 12000)
                this.disabledUp = true;
            if (this.powerUpActivated === 4 && date.getTime() - this.lastDate.getTime() >= 10000)
                this.disabledUp = true;
        }

        //collision with right paddle (first player left)
        if (this.Ball.x + this.Ball.width >= this.PlayerRight.x 
            && ballBottom >= this.PlayerRight.y && this.Ball.y <= paddleRightBottom)
        {
            const ratio = 0.8 / this.PlayerRight.middleY;
            let impactOnPaddle:number;

            // Ball middle hit outside RightPaddle top
            if (this.Ball.y + this.Ball.middleY < this.PlayerRight.y)
                impactOnPaddle = ballBottom - this.PlayerRight.y;
            // Ball middle hit outside RightPaddle bottom
            else if (this.Ball.y + this.Ball.middleY > paddleRightBottom)
                impactOnPaddle = this.Ball.y - this.PlayerRight.y;
            // Ball middle hit inside RightPaddle
            else
                impactOnPaddle = (this.Ball.y + this.Ball.middleY) - this.PlayerRight.y;
            
            this.Ball.yVec = ratio * (impactOnPaddle - this.PlayerRight.middleY);
            this.Ball.xVec = -1;
            this.lastPaddleTouched = "right";

            if (this.powerUpActivated === 1 && date.getTime() - this.lastDate.getTime() >= 12000)
                this.disabledUp = true;
            if (this.powerUpActivated === 4 && date.getTime() - this.lastDate.getTime() >= 10000)
                this.disabledUp = true;
        }

        this.Ball.x += this.Ball.xVec * this.Ball.speed;
        this.Ball.y += this.Ball.yVec * this.Ball.speed;

        return { ballX: this.Ball.x, ballY: this.Ball.y, scoreLeft: this.playerLeftScore, scoreRight:this.playerRightScore};
    }

    udpatePlayerPosition(client: Socket, newY:number)
    {
        if (client.data.position === 'left')
            this.PlayerLeft.y = newY;

        else if (client.data.position === 'right')
            this.PlayerRight.y = newY;
    }

    /*
        state 0 : no up on game but 3 is returned if up has to disappear
        state 1 : an up is on game
        state 2 : an up had been caught and is currently used
    */
    checkUp() : number
    {
        const date: Date = new Date();

        // a new up appear every 8.5 sec
        if (date.getTime() - this.lastDate.getTime() >= 8500 && this.powerUpState === 0)
        {    
            this.powerUpState = 1;
            this.lastDate = date;
            this.powerUpActivated = Math.floor(Math.random() * 4) + 1;
            return (1);
        }

        // if an up is on game and not caught for 15sec, it disappears
        else if (date.getTime() - this.lastDate.getTime() >= 15000 && this.powerUpState === 1)
        {
            this.powerUpState = 0;
            this.lastDate = date;
            return (3);
        }

        // if an up is caught, it is activated
        if (this.powerUpState === 1 && this.lastPaddleTouched.length !== 0
             && ((this.Ball.x >= this.Up.x && this.Ball.x <= this.Up.x + this.Up.width)
                || (this.Ball.x + this.Ball.width >= this.Up.x && this.Ball.x + this.Ball.width <= this.Up.x + this.Up.width))
             && ((this.Ball.y >= this.Up.y && this.Ball.y <= this.Up.y + this.Up.height)
                || (this.Ball.y + this.Ball.height >= this.Up.y && this.Ball.y + this.Ball.height <= this.Up.y + this.Up.height)))
        {
             this.powerUpState = 2;
             this.lastDate = date;
             
            if (this.powerUpActivated === 1)
            {
                if (this.lastPaddleTouched === 'left')
                    this.PlayerLeft.height = 200;
                else if (this.lastPaddleTouched === 'right')
                    this.PlayerRight.height = 200;
            }

            else if (this.powerUpActivated === 2)
            {
                if (this.lastPaddleTouched === 'left')
                    this.Ball.x = 3/4 * this.Canvas.width;
 
                else if (this.lastPaddleTouched === 'right')
                    this.Ball.x = 1/4 * this.Canvas.width;

                this.Ball.y = Math.floor(Math.random() * (this.Canvas.height - this.Ball.height + 1));
            }

            else if (this.powerUpActivated === 3)
            {
                this.Ball.speed = 4.5;
            }

            return (2);
        }

        // if an up is activated, its action last for a certain amount of time according to the up
        // everything return normal when its action is over
        if (this.powerUpState === 2)
        {
            if (this.powerUpActivated === 1 && date.getTime() - this.lastDate.getTime() >= 12000 && this.disabledUp)
            {
                this.powerUpState = 0;
                this.lastDate = date;
                this.disabledUp = false;
                this.PlayerLeft.height = 100;
                this.PlayerRight.height = 100;
                return (4);
            }

            else if (this.powerUpActivated === 2)
            {
                this.powerUpState = 0;
                this.lastDate = date;
                return (4);
            }

            else if (this.powerUpActivated === 3 && date.getTime() - this.lastDate.getTime() >= 8500)
            {
                this.powerUpState = 0;
                this.lastDate = date;
                this.Ball.speed = 2.5;
                return (4);
            }

            else if (this.powerUpActivated === 4 && date.getTime() - this.lastDate.getTime() >= 10000 && this.disabledUp)
            {
                this.powerUpState = 0;
                this.disabledUp = false;
                this.lastDate = date;
                return (4);
            }
        }

        return (0);
    }

    get CanvasHeight(): number {
        return (this.Canvas.height);
    }

    get CanvasWidth(): number {
        return (this.Canvas.width);
    }

    get PlayerHeight(): number {
        return (this.PlayerLeft.height);
    }

    get PlayerWidth(): number {
        return (this.PlayerLeft.width);
    }

    get BallWidth(): number {
        return (this.Ball.width);
    }

    get BallHeight(): number {
        return (this.Ball.height);
    }

    get UpWidth(): number {
        return (this.Up.width);
    }

    get UpHeight(): number {
        return (this.Up.height);
    }

    get PowerUpActivated() : number {
      return (this.powerUpActivated);  
    }

    get LastPaddleTouched() : string {
        return (this.lastPaddleTouched);
    }

    setUpCoords(x: number, y: number) {
        this.Up.x = x;
        this.Up.y = y;
    }
}