import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chatroom } from "../entities/chatroom.entity";
import { ChatroomService } from './chatroom.service';
import { ChatroomController } from './chatroom.controller';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from 'src/auth/guards/JwtGuards';
import { UserChatroom } from 'src/entities/userchatroom.entity';
import { UserChatroomController } from 'src/userChatroom/userChatroom.controller';
import { UserController } from 'src/user/user.controller';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UserChatroomService } from 'src/userChatroom/userChatroom.service';

@Module({
    imports: [TypeOrmModule.forFeature([Chatroom, UserChatroom, User])],
    controllers: [ChatroomController, UserChatroomController, UserController],
    providers: [ChatroomService, UserChatroomService, UserService, JwtGuard, JwtService]
})
export class ChatroomModule {}
