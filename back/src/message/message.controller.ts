import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MessageService } from "./message.service";
import {CreateMessageDto} from "./dto/createMessageDto";


@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    create(@Body() createMessageDto: CreateMessageDto) {
        return this.messageService.create(createMessageDto);
    }

    @Get('getFromChatroom/:chatRoomId')
    getInfoByUsername(@Param('chatRoomId') chatRoomId:number)
    {
        return this.messageService.getAllMessageFromChatroomId(chatRoomId);
    }

}