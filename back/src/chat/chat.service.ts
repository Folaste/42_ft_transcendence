import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService
{
    private allConnectedUsers : Socket[] = [];

    addUser(socket : Socket)
    {
        this.allConnectedUsers.push(socket);
    }

    deleteUser(socket : Socket)
    {
        const index : number = this.allConnectedUsers.indexOf(socket);

        if(index !== -1)
            this.allConnectedUsers.slice(index, 1);
    }

    getUserSocket(id : number) : Socket
    {
        
        for (const elem of this.allConnectedUsers)
        {
            if (elem.data.userId === id)
                return (elem);
        }

        return null
    }
}
