import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PendingInvitation} from "../entities/pendingInvitation.entity";
import {Chatroom} from "../entities/chatroom.entity";
import {User} from "../entities/user.entity";
import {UserController} from "../user/user.controller";
import {ChatroomController} from "../chatroom/chatroom.controller";
import {UserService} from "../user/user.service";
import {ChatroomService} from "../chatroom/chatroom.service";
import {PendingInvitationService} from "./pendingInvitation.service";
import {PendingInvitationController} from "./pendingInvitation.controller";
import {JwtGuard} from "../auth/guards/JwtGuards";
import {JwtService} from "@nestjs/jwt";
import {UserChatroom} from "../entities/userchatroom.entity";
import {UserChatroomController} from "../userChatroom/userChatroom.controller";
import {UserChatroomService} from "../userChatroom/userChatroom.service";

@Module({
    imports: [TypeOrmModule.forFeature([PendingInvitation, Chatroom, User, UserChatroom])],
    controllers: [UserController, ChatroomController, PendingInvitationController, UserChatroomController],
    providers: [UserService, ChatroomService, PendingInvitationService, UserChatroomService, JwtService, JwtGuard]
})
export class PendingInvitationModule {}