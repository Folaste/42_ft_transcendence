import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "../entities/message.entity";
import { MessageController } from "./message.controller"
import { MessageService } from "./message.service"
import { UserService } from "../user/user.service";
import { ChatroomService } from "../chatroom/chatroom.service";
import { Chatroom } from "../entities/chatroom.entity";
import { User } from "../entities/user.entity";
import { UserController } from "../user/user.controller";
import { ChatroomController } from "../chatroom/chatroom.controller";
import { JwtGuard } from "src/auth/guards/JwtGuards";
import { JwtService } from "@nestjs/jwt";
import { UserChatroom } from "src/entities/userchatroom.entity";
import { UserChatroomController } from "src/userChatroom/userChatroom.controller";
import { UserChatroomService } from "src/userChatroom/userChatroom.service";

@Module({
    imports: [TypeOrmModule.forFeature([Message, User, Chatroom, UserChatroom])],
    controllers: [MessageController, UserController, ChatroomController, UserChatroomController],
    providers: [MessageService, UserService, ChatroomService, UserChatroomService, JwtGuard, JwtService]
})
export class MessageModule {}