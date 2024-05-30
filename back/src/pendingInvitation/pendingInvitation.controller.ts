import {Body, Controller, Delete, Get, Param, Post} from "@nestjs/common";
import {PendingInvitationService} from "./pendingInvitation.service";
import {CreatePendingInvitationDto} from "./dto/createPendingInvitationDto";

@Controller("invitations")
export class PendingInvitationController {

    constructor(private readonly pendingInvitationService: PendingInvitationService) {}

    @Delete("/deleteAllOnChatroom/:chatroomId")
    deleteAllOnChatroom(@Param("chatroomId") chatroomId: number) {
        return this.pendingInvitationService.deleteAllOnChatroom(chatroomId);
    }

    @Post()
    create(@Body() createPendingInvitationDto: CreatePendingInvitationDto) {
        return this.pendingInvitationService.create(createPendingInvitationDto);
    }
    
    @Delete(":id")
    delete(@Param("id") id: number) {
        return this.pendingInvitationService.delete(id);
    }
    
    @Delete(":userId/:chatroomId")
    deleteByChatroomAndUserId(@Param("userId") userId: number, @Param("chatroomId") chatroomId: number) {
        return this.pendingInvitationService.deleteByChatroomAndUserId(userId, chatroomId);
    }
    
    @Get(":userId")
    getFromUserId(@Param("userId") userId: number) {
        return this.pendingInvitationService.getFromUserId(userId);
    }
    
    @Get(":userId/:chatroomId")
    getFromUserIdAndChatroomId(@Param("userId") userId: number, @Param("chatroomId") chatroomId: number) {
        return this.pendingInvitationService.getFromUserIdAndChatroomId(userId, chatroomId);
    }


    
}