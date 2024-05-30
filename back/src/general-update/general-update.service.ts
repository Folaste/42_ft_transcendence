import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface iUser {
    id: number,
    login42: string,
    nickname: string,
    avatarURI: string,
    email: string,
}

@Injectable()
export class GeneralUpdateService 
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

    getAllUsersStatus(users:{ id: number; user: iUser; }[]) : {id:number, status:string}[]
    {
        let userMap: {id:number, status:string}[] = [];

        if (!users)
            return userMap;

        for (let i : number = 0; i < users.length; i++)
        {
            let status = 'disconnected';

            for (const elem of this.allConnectedUsers)
            {
                if (elem.data.id === users[i].user.id)
                {
                    if (status === 'disconnected')
                        status = elem.data.status;
                    else if (status === 'connected' && (elem.data.status === 'matchMaking' || elem.data.status === 'onGame'))
                        status = elem.data.status;
                    else if (status === 'matchMaking' && elem.data.status === 'onGame')
                    {
                        status = elem.data.status;
                        break ;
                    }
                }
            }
            userMap.push({id: users[i].user.id, status: status});
        }
        return (userMap);
    }

    getAUserStatus(id : number) : string
    {
        let status = 'disconnected';

        for (const elem of this.allConnectedUsers)
        {
            if (elem.data.id == id)
            {
                if (status === 'disconnected')
                    status = elem.data.status;
                else if (status === 'connected' && (elem.data.status === 'matchMaking' || elem.data.status === 'onGame'))
                    status = elem.data.status;
                else if (status === 'matchMaking' && elem.data.status === 'onGame')
                {
                    status = elem.data.status;
                    break ;
                }
            }
        }

        return (status);
    }

    getUserSocket(id : number) : Socket
    {
        let socket = null;
        
        for (const elem of this.allConnectedUsers)
        {
            if (elem.data.id === id)
                socket = elem;
        }

        return (socket);
    }
}