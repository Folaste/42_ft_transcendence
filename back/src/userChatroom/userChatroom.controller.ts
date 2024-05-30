import {Body, Controller, Post, Put, Delete, Param, Get} from "@nestjs/common";
import {UserChatroomService} from "./userChatroom.service";
import {CreateUserchatroomDto} from "./dto/createUserchatroomDto";
import {UpdateUserchatroomDto} from "./dto/updateUserchatroomDto";

@Controller('userChatroom')
export class UserChatroomController {

    constructor(private readonly userChatroomService: UserChatroomService) {}

    @Post()
    create(@Body() createUserchatroomDto: CreateUserchatroomDto) {
        return this.userChatroomService.create(createUserchatroomDto);
    }

    @Put(":id")
    update(@Param("id") id:number, @Body() updateChatRoomUserDto: UpdateUserchatroomDto)
    {
        return this.userChatroomService.update(id, updateChatRoomUserDto);
    }

    @Get("getUserChatroom/:userId/:chatroomId")
    getUserChatroom(@Param("userId") userId:number, @Param("chatroomId") chatroomId:number)
    {
        return this.userChatroomService.get(userId, chatroomId);
    }

    @Delete(":id")
    delete(@Param("id") id: number) {
        return this.userChatroomService.delete(id);
    }
}