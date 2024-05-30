import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserChatroom } from "../entities/userchatroom.entity";
import { User } from "../entities/user.entity";
import { Chatroom } from "../entities/chatroom.entity";
import { UserChatroomController } from "./userChatroom.controller"
import { UserController } from "../user/user.controller";
import { ChatroomController } from "../chatroom/chatroom.controller";
import { UserChatroomService } from "./userChatroom.service";
import { UserService } from "../user/user.service";
import { ChatroomService } from "../chatroom/chatroom.service";
import { JwtService } from "@nestjs/jwt";
import { JwtGuard } from "src/auth/guards/JwtGuards";

@Module({
    imports: [TypeOrmModule.forFeature([UserChatroom, User, Chatroom])],
    controllers: [UserChatroomController, UserController, ChatroomController],
    providers: [UserChatroomService, UserService, ChatroomService, JwtGuard, JwtService]
})
export class UserChatroomModule {}