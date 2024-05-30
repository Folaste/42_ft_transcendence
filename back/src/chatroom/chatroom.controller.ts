import {Body, Controller, Get, Post, Put, Param, Delete} from "@nestjs/common";
import { ChatroomService } from "./chatroom.service";
import { CreateChatroomDto } from "./dto/createChatroomDto";
import {UpdateChatroomDto} from "./dto/updateChatroomDto";
import { CreateUserchatroomDto } from "src/userChatroom/dto/createUserchatroomDto";

function isNumberInString(param:any): boolean {
    return !isNaN(param);

}

@Controller('chatroom')
export class ChatroomController {
    constructor(private readonly chatroomService: ChatroomService) {}

    @Get(':chatroom')
    findUser(@Param("chatroom") id:string)
    {
        if (isNumberInString(id) === true)
        {
            let chatroomId: number = +id;
            if (chatroomId === -1)
                return this.chatroomService.getAllChatrooms();
            return this.chatroomService.getChatroomWithMessages(chatroomId);
        }
        else
        {
            return this.chatroomService.getChatroomByName(id);
        }
    }

    @Get("/getAllDirectMessagesFromUserId/:userId")
    findFriends(@Param("userId") userId:number)
    {
        return this.chatroomService.getDirectMessagesFromUserId(userId);
    }

    @Get("/getAllChatroomsFromUserId/:userId")
    findUserChatrooms(@Param("userId") userId:number)
    {
        return this.chatroomService.getChatroomsFromUserId(userId);
    }

    @Get("/getAllPublicChatroomsButFromUserId/:userId")
    findPublicChatroomsButUserId(@Param("userId") userId:number)
    {
        return this.chatroomService.getAllPublicChatroomsButFromUserId(userId);
    }

    @Get("/getAllProtectedChatroomsButFromUserId/:userId")
    findProtectedChatroomsButUserId(@Param("userId") userId:number)
    {
        return this.chatroomService.getAllProtectedChatroomsButFromUserId(userId);
    }

    @Get("/getAllPrivateChatroomsButFromUserId/:userId")
    findPrivateChatroomsButUserId(@Param("userId") userId:number)
    {
        return this.chatroomService.getAllPrivateChatroomsButFromUserId(userId);
    }

    @Get("/getAllUsersFromChatroomId/:chatroomId")
    findAllUsersFromChatroomId(@Param("chatroomId") chatroomId:number)
    {
        return this.chatroomService.getAllUsersFromChatroomId(chatroomId);
    }

    @Get("/getAllUsersButFromChatroomId/:chatroomId")
    findAllUsersButFromChatroomId(@Param("chatroomId") chatroomId:number)
    {
        return this.chatroomService.getAllUsersButFromChatroomId(chatroomId);
    }


    @Post()
    create(@Body() createChatroomDto: CreateChatroomDto)
    {
        return this.chatroomService.create(createChatroomDto);
    }

    @Post("/createChatroom")
    createChatroom(@Body() chatroomInfos: CreateChatroomDto)
    {
        return this.chatroomService.createChatroom(chatroomInfos);
    }


    @Post("/joinChatroom")
    joinChatroom(@Body() chatroomInfos: CreateUserchatroomDto)
    {
        return this.chatroomService.joinChatroom(chatroomInfos);
    }

    @Put(":id")
    update(@Param("id") id: number, @Body() updateChatroomDto: UpdateChatroomDto)
    {
        return this.chatroomService.update(id, updateChatroomDto);
    }

    @Delete(":id")
    delete(@Param("id") id: number)
    {
        return this.chatroomService.delete(id);
    }
}