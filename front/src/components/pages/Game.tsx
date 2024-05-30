import React, { useContext, useEffect, useRef, useState } from "react";
import NavBar from "../NavBar/navbar";
import io, { Socket } from 'socket.io-client';
import joy from '../../images/joy.png'
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectDatas } from "../../stores/selector";
import api from "../../api/axios";
import { SocketContext } from "../../context/SocketContext";

export class Pong
{
  // Class Attributes
  public static keysPressed: { [key:string]: boolean } = {};
  public static webSocket: Socket | null;

  private canvasRef: React.RefObject<HTMLCanvasElement>;
  private readonly canvas: HTMLCanvasElement | null;
  private readonly context: CanvasRenderingContext2D | null;

  private playerPosition:string;
  private currPlayer: CurrPlayer | null;
  private opponent: Opponent | null;
  private ball: Ball | null;
  private powerUp: Up | null;

  private readonly endGameState : (number : number) => void;
  private readonly setMatch : (string : string) => void;

  private readonly powerUpOn: boolean;

  private leftId : number;
  private rightId : number;
  private readonly opponentIdInvite : number;
  private leftUsername : string;
  private rightUsername : string;

  private gameData:
  {
    ballX: number,
    ballY: number,
    opponentY: number,
    scoreLeft: number,
    scoreRight: number,
  };

  private opponentLeft: boolean;
  private youWin : boolean;
  private isEnd: boolean;

  private animationFrameId: number;

  private generalSocket: Socket;

  // Pong Constructor
  constructor(canvasRef: React.RefObject<HTMLCanvasElement>, endGameState : (number : number) => void, UpOrNot:boolean, setMatch : (string : string) => void, username : string, userId : number, generalSocket: Socket, opponentIdInvite: number)
  {
    // Init Attributes
    Pong.webSocket = null;

    this.canvasRef = canvasRef;
    this.canvas = this.canvasRef.current;
    this.context = null;
  
    this.playerPosition = 'right';
    this.currPlayer = null;
    this.opponent = null;
    this.ball = null;
    this.powerUp = null;

    this.powerUpOn = UpOrNot;
    this.rightId = userId;
    this.leftId = -1;
    this.opponentIdInvite = opponentIdInvite;

    this.leftUsername = "";
    this.rightUsername = username;

    this.endGameState = endGameState;
    this.setMatch = setMatch;
  
    this.gameData = {
      ballX: 0,
      ballY: 0,
      opponentY: 0,
      scoreLeft: 0,
      scoreRight: 0
    };
    
    this.opponentLeft = false;
    this.youWin = false;
    this.isEnd = false;

    this.animationFrameId = 0;

    this.generalSocket = generalSocket;

    this.connectToBackEnd();

    if (this.canvas)
    {
      this.context = this.canvas.getContext('2d');
      
      this.gameData.opponentY = this.MIDY - 50;
      this.gameData.ballX = this.MIDX - 6;
      this.gameData.ballY = this.MIDY - 6;
    }

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  /*
    Connect Web Socket to the Back-EndhandleChatConnection
    Handle listener on the Back-End with the Web Socket
  */
  connectToBackEnd()
  {
    // Connection to the webSocket
    Pong.webSocket = io('http://localhost:3001/game');
    Pong.webSocket.emit('joinRoom', this.powerUpOn, this.rightUsername, this.rightId, this.opponentIdInvite);
    
    this.generalSocket.emit('changeUserStatus', 'matchMaking');

    // If player is the first connected then he will be the left player
    Pong.webSocket.on('LeftPlayer', (wP:number, hP:number, wB:number, hB:number, opponentName : string, opponentId : number) => {
      if (this.canvas)
      {
        this.currPlayer = new CurrPlayer(10, this.MIDY - 50, wP, hP, 0.5);
        this.opponent = new Opponent(this.canvas.width - 22, this.MIDY - 50, wP, hP, 0.5);
        this.ball = new Ball(this.MIDX - 6, this.MIDY - 6, wB, hB, 5);
      }

      this.playerPosition = 'left';
      this.leftUsername = this.rightUsername;
      this.rightUsername = opponentName;

      this.leftId = this.rightId;
      this.rightId = opponentId;

      this.setMatch(this.leftUsername  + " VS " + this.rightUsername);
    })

    /*
     If player is the second connected then he will be the right player
     And the game starts
    */
    Pong.webSocket.on('RightPlayer', (wP:number, hP:number, wB:number, hB:number, opponentName : string, opponentId : number) => {
      if (this.canvas)
      {
        this.currPlayer = new CurrPlayer(this.canvas.width - 22, this.MIDY - 50, wP, hP, 0.5);
        this.opponent = new Opponent(10, this.MIDY - 50, wP, hP, 0.5);
        this.ball = new Ball(this.MIDX - 6, this.MIDY - 6, wB, hB, 5);
      }

      this.leftUsername = opponentName;
      this.leftId = opponentId;

      this.setMatch(this.leftUsername + " VS " + this.rightUsername);
    })

    // Check if the opponent has left
    Pong.webSocket.on('PlayerDisconnected', () => {
        this.opponentLeft = true;
    })

    // Receive game updates from the server (Opponent Position, Scores, Ball Position)
    Pong.webSocket.on('updateOpponent', (opponentY : number) => {
      this.gameData.opponentY = opponentY;
    });

    Pong.webSocket.on('moveBall', (ballX : number, ballY : number) => {
      this.gameData.ballX = ballX;
      this.gameData.ballY = ballY;
    });

    Pong.webSocket.on('updateScore', (scoreLeft : number, scoreRight : number) => {
      if (this.currPlayer && this.opponent)
      {
        this.gameData.scoreLeft = scoreLeft;
        this.gameData.scoreRight = scoreRight;
      }
    });

    Pong.webSocket.on('upAppear', (whichUp: number, shiftX: number, shiftY:number, w:number, h:number) => {
      this.powerUp = new Up(this.MIDX + shiftX, this.MIDY + shiftY, w, h, 0, whichUp);
    })

    Pong.webSocket.on('catchUp', (whoCaught:string) => {
      if (this.context && this.currPlayer && this.opponent)
      {
        this.powerUp?.clear(this.context);
        
        if (this.powerUp?.whichUp === 1 && whoCaught === this.playerPosition)
          this.currPlayer.height = 200;
        else if (this.powerUp?.whichUp === 1)
          this.opponent.height = 200;

        else if (this.powerUp?.whichUp === 4)
          this.currPlayer.invert = true;
        
        else if (this.powerUp?.whichUp === 2)
          this.ball?.clear(this.context);
      }

      this.powerUp = null;
    })

    Pong.webSocket.on('endUp', () => {
      if (this.currPlayer && this.opponent)
      {
        this.currPlayer.height = 100;
        this.opponent.height = 100;

        this.currPlayer.invert = false;
      }
    })

    Pong.webSocket.on('clearUp', () => {
      if (this.context)
        this.powerUp?.clear(this.context);
      this.powerUp = null;
    })

    Pong.webSocket.on('endGame', (whoWon : string) => {
      this.isEnd = true;
      if (this.playerPosition === whoWon)
        this.youWin = true;
    });

  }

  async startGame()
  {
    this.generalSocket.emit('changeUserStatus', 'onGame');
    
    // starts the game when there are 2 players in the room
    if (this.canvas)
    {
      // starts a chrono before the game
      if (this.canvas && this.context) {
        this.currPlayer?.draw(this.context);
        this.opponent?.draw(this.context);
    
        let i = 3;
        while (i > 0 && !this.isEnd) {
          this.drawBackground();
          this.context.font = "50px Orbitron";
          this.context.fillStyle = 'orange';
          this.context.fillText(i.toString(), this.MIDX - 10, this.MIDY + 19);
          await this.sleep(1000);
          i--;
        }
        
        if (!this.isEnd) {
          this.drawBackground();
          this.context.font = "50px Orbitron";
          this.context.fillStyle = 'orange';
          this.context.fillText("GO !", this.MIDX - 35, this.MIDY + 19);
          await this.sleep(500);
        }
      }    

     if (this.isEnd)
      return ;

      Pong.webSocket?.emit('initBackGame', this.canvas?.width, this.canvas?.height,
        this.currPlayer?.x, this.currPlayer?.y, this.ball?.x, this.ball?.y, this.powerUpOn
      );

      // If player left during the timer then don't launch the game
      if (!this.opponentLeft)
      {
        Pong.webSocket?.emit('getGameInfos');
        this.gameLoop();
      }
      else
        this.endGame();
    }
  }

  /*
   Game Loop, Update player / opponent / ball move. 
   And check end game
  */
  gameLoop()
  {
    if (this.canvas && this.context && this.currPlayer && this.opponent && this.ball)
    {
      this.drawBackground();

      Pong.webSocket?.emit('getGameInfos');

      this.currPlayer.move(this.context, this.canvas);
      this.opponent.update(this.gameData.opponentY);

      this.currPlayer.draw(this.context);
      this.opponent.draw(this.context);

      this.ball.update(this.context, this.gameData.ballX, this.gameData.ballY);

      if (!this.isEnd && !this.opponentLeft)
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
      else
        this.endGame();
    }
  }

  // Draw Background, center lines and scores
  drawBackground()
  {
    this.drawBlack();
    this.drawCenterLine();
    this.drawScores();

    if (this.powerUpOn && this.context && this.canvas)
      this.powerUp?.draw(this.context);
  }

  // Draw the black background
  drawBlack()
  {
    if (this.canvas && this.context)
    {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.globalAlpha = 0.5;
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Draw the center line (with the little white squares)
  drawCenterLine()
  {
    if (this.canvas && this.context)
    {
      this.context.globalAlpha = 0.7;
      for (let i:number = 0; i < this.canvas.height; i += 80)
      {
        this.context.fillStyle = 'white';
        this.context.fillRect(this.MIDX - 6, i, 12, 45);
      }
    }
  }

  // Write scores
  drawScores()
  {
    if (this.canvas && this.context && this.currPlayer && this.opponent)
    {
      this.context.globalAlpha = 1;
      this.context.fillStyle = 'white';

      this.context.font = "50px Poppins";
      this.context.fillText(this.gameData.scoreLeft.toString(), this.MIDX - 70, 70);
      this.context.fillText(this.gameData.scoreRight.toString(), this.MIDX + 40, 70);
    }
  }

  // Make end the game if there is a winner or someone leave : Snap
  endGame()
  {
    if (this.context && this.canvas && this.currPlayer && this.opponent)
    {
      this.drawBlack();
      this.drawScores();
      

      let requestData = 
      {
        powerUps: this.powerUpOn,
        playerLeftId: this.leftId,
        scoreLeft: this.gameData.scoreLeft,
        victoryLeft: false,
        disconnectedLeft: false,
        playerRightId: this.rightId,
        scoreRight: this.gameData.scoreRight,
        victoryRight: false,
        disconnectedRight: false
      }

      if (this.opponentLeft && this.gameData.scoreLeft !== 5 && this.gameData.scoreRight !== 5)
      {
        if (this.playerPosition === 'right')
        {
          requestData.victoryRight = true;
          requestData.disconnectedLeft = true;
        }
        else
        {
          requestData.victoryLeft = true;
          requestData.disconnectedRight = true;
        }

        api.post("/match", requestData).then
        (
          () => { 
            this.endGameState(2);
          }
        ).catch
        (
            err => {
                console.log(err);
            }
        )
      }

      else if (this.youWin)
      {
        if (this.playerPosition === 'right')
          requestData.victoryRight = true;
        else
          requestData.victoryLeft = true;

        api.post("/match", requestData).then
        (
          () => {
            this.endGameState(1);
          }
        ).catch
        (
            err => {
                console.log(err);
            }
        )
      }

      else
      {
        this.endGameState(3);
      }

      this.stopGame();
    }
  }

  /*
   Set isEnd to true
   Clear all EventListeners
   Make off web socket listeners
   Disconnet web socket
  */
  stopGame()
  {
    this.generalSocket.emit('changeUserStatus', 'connected');
    this.isEnd = true;

    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);

    Pong.webSocket?.off('LeftPlayer');
    Pong.webSocket?.off('RightPlayer');

    Pong.webSocket?.off('Letsgo');
    Pong.webSocket?.off('PlayerDisconnected');
    Pong.webSocket?.off('updateOpponent');
    Pong.webSocket?.off('moveBall');
    Pong.webSocket?.off('updateScore');
    Pong.webSocket?.off('JoyEasterEgg');

    Pong.webSocket?.off('clearUp');
    Pong.webSocket?.off('upAppear');
    Pong.webSocket?.off('catchUp');
    Pong.webSocket?.off('endUp');
    Pong.webSocket?.off('endGame');
    Pong.webSocket?.disconnect();
  }

  // Help to sleep in the start chrono
  sleep(ms: number): Promise<void>
  {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Handle keyDown by setting the right value to true in keysPressed
  handleKeyDown = (e: KeyboardEvent) => {
    Pong.keysPressed[e.key] = true;
  }

  // Handle keyUp by setting the right value to false in keysPressed
  handleKeyUp = (e: KeyboardEvent) => {
    Pong.keysPressed[e.key] = false;
  }

  // when the mouse go out of window, set false for arrowUp and arrowDown
  handleBlur = () => {
    Pong.keysPressed["ArrowUp"] = false;
    Pong.keysPressed["ArrowDown"] = false;
  }

  get MIDY(): number {
    if (this.canvas)
      return (this.canvas.height / 2);
    else
      return (0);
  }

  get MIDX(): number {
    if (this.canvas)
      return (this.canvas.width / 2);
    else
      return (0);
  }
}

class Element
{
  speed:number;
  width:number;
  public height:number;
  x:number;
  y:number;

  constructor(x:number,y:number,w:number,h:number, s:number)
  {       
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.speed = s;
  }

  draw(context:CanvasRenderingContext2D)
  {
    context.fillStyle = 'white';
    context.fillRect(this.x, this.y, this.width, this.height);    
  }

  clear(context:CanvasRenderingContext2D)
  {
    context.fillStyle = 'black';
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

class CurrPlayer extends Element
{
  public invert:boolean = false;
  private shift:number = 20;

  move(context:CanvasRenderingContext2D, canvas:HTMLCanvasElement)
  {
    if ((Pong.keysPressed["ArrowUp"] && !this.invert) || (this.invert && Pong.keysPressed["ArrowDown"]))
    {
      if (this.y - 10 > 0)
      {
        this.clear(context);
        this.y -= this.shift * this.speed;
        this.draw(context);
      }
      Pong.webSocket?.emit('gameUpdate', this.y);
    }

    else if ((Pong.keysPressed["ArrowDown"] && !this.invert) || (this.invert && Pong.keysPressed["ArrowUp"]))
    {
      if (this.y + this.height + 10 < canvas.height)
      {
        this.clear(context);
        this.y += this.shift * this.speed;
        this.draw(context);
      }
      
      Pong.webSocket?.emit('gameUpdate', this.y);
    }
  }
}

class Opponent extends Element
{
  update(currY:number)
  {
    this.y = currY;
  }
}

class Ball extends Element
{
  update(context:CanvasRenderingContext2D, currX:number, currY:number)
  {
    this.clear(context);

    this.x = currX;
    this.y = currY;

    this.draw(context);
  }
}

class Up extends Element
{
  public whichUp: number;

  constructor(x: number, y: number, w: number, h: number, s: number, whichUp: number)
  {
    super(x, y, w, h, s);
    this.whichUp = whichUp;
  }

  draw(context:CanvasRenderingContext2D)
  {
    switch (this.whichUp)
    {
      // paddle maxi length = blue
      case 1:
        context.fillStyle = '#34A6BF';
        break;
      
      // ball teleportation with higher speed = pink
      case 2:
        context.fillStyle = '#EA5375';
        break;

      // ball speed increases = purple
      case 3:
        context.fillStyle = '#85296F';
        break;
      
      // invert up and down keys = green
      case 4:
        context.fillStyle = '#1C834E';
        break;
    }

    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);
  const [endGameState, setEndGameState] = useState(0);
  const data = useSelector(selectDatas);
  const [match, setMatch] = useState(data.nickname);

  const generalSocket = useContext(SocketContext);
  const location = useLocation();

  useEffect(() =>
    {
      let opponentId: number = -1;
      let upOrNot : boolean = false;

      if (location.state)
        upOrNot = location.state.upOrNot;
      
      if (window.history.state.opponentId)
        opponentId = window.history.state.opponentId;

      if (window.history.state.upOrNot)
        upOrNot = window.history.state.upOrNot;

      const pongInstance = new Pong(canvasRef, setEndGameState, upOrNot, setMatch, data.nickname, data.id, generalSocket, opponentId);

      if (pongInstance)
      {
        Pong.webSocket?.on('Letsgo', () => {
          setGameStarted(true);
          pongInstance?.startGame();
        })

        Pong.webSocket?.on('JoyEasterEgg', (score42: boolean) => {
          if (score42)
            setEasterEgg(true);
          else
            setEasterEgg(false);
        })
      }

      return () => {
        pongInstance?.stopGame();
      }
    }
  , []);

  function playAgain()
  {
    window.location.reload();
  }

  return (
    <div className="h-screen flex flex-col overflow-auto overscroll-contain {bg-[url('/src/images/bg4.svg')]}" >

        <NavBar />
        <div className="z-10 flex flex-col items-center mt-5 w-screen h-screen overflow-auto overscroll-contain pt-16" id="scrollbar">

          <div className="flex items-center border-2 rounded-full border-orange-400 pr-10 pl-10 text-xl text-center justify-center h-20 w-[80%] md:w-auto" >
            {gameStarted ? (<p className="overflow-hidden">{match}</p>) : (<p>Waiting...</p>)}
          </div>

          <div className="relative flex flex-col flex-wrap w-[100%] xl:w-[80%]">
            <canvas className="shadow-[0_0px_10px_0px_rgb(0,0,0,0.3)] shadow-orange-400 border-orange-400 w-[90%] xl:w-[75%] flex-wrap rounded-2xl overflow-auto overscroll-contain m-auto mt-10 mb-10 border-2 " width={1000} height={600} ref={canvasRef} />
            
            <div className="flex flex-col justify-center absolute w-full top-[40%] bottom-[48%]">
              {endGameState === 1 ? <p className="text-xl  md:text-3xl text-center font-bold text-green-600">YOU WON</p> : null}
              {endGameState === 2 ? (
                <div>
                  <p className="text-xl  sm:text-3xl text-center font-bold text-green-600">YOU WON</p>
                  <p className="text-xl  sm:text-3xl text-center font-bold text-green-600 pt-3">Your opponent was scared of you, he left</p> 
                </div>) : null}
                {endGameState === 3 ? <p className="text-xl sm:text-3xl  text-center font-bold text-red-600">YOU LOST</p> : null}
            </div>
            
            <div className={`flex pt-10 justify-center absolute w-full ${endGameState === 2 ? 'bottom-[25%]' : 'bottom-[30%]'}`}>
              {endGameState === 1 || endGameState === 2 ? <button onClick={playAgain} className="border-2 rounded-full font-bold shadow-lg shadow-green-600 border-green-700 pr-5 pl-5 lg:pr-10 lg:pl-10 pt-3 pb-3 hidden sm:inline-flex">Play again</button> : null}
              {endGameState === 3 ? <button onClick={playAgain} className="border-2 rounded-full font-bold shadow-lg shadow-red-600 border-red-700 pr-5 pl-5 lg:pr-10 lg:pl-10 pt-3 pb-3  hidden sm:inline-flex">Play again</button> : null}
            </div>
          </div>

          <div className="absolute flex flex-col bottom-0 justify-end w-full h-[15%] sm:h-[5%]">
            <div className="absolute right-10">
              {easterEgg ? <img alt = "Joy Easter Egg" className='w-28 h-32 hidden md:block' src={joy}></img>: null }
            </div>
          </div>
        </div>
   </div>
  );
}

export { Game };