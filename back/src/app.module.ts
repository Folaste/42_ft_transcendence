import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { MatchModule } from './match/match.module';
import { MessageModule } from "./message/message.module";
import { UserChatroomModule } from "./userChatroom/userChatroom.module";

import { User } from './entities/user.entity';
import { Block } from "./entities/block.entity";
import { Chatroom } from "./entities/chatroom.entity";
import { UserChatroom } from "./entities/userchatroom.entity";
import { Match } from "./entities/match.entity";
import { Message } from "./entities/message.entity";
import { MailerModule } from '@nestjs-modules/mailer';
import { TwoFaCode } from './entities/twoFaCode.entity';
import {TwoFaCodeModule} from "./twoFaCode/twoFaCode.module";
import {BlockModule} from "./block/block.module";

import { ChatModule } from './chat/chat.module';
import { GeneralUpdateModule } from './general-update/general-update.module';
import {Friend} from "./entities/friend.entity";
import {FriendModule} from "./friend/friend.module";
import {PendingInvitation} from "./entities/pendingInvitation.entity";
import {PendingInvitationModule} from "./pendingInvitation/pendingInvitation.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env'] }),
    TypeOrmModule.forRoot(
      {
        type: "postgres",
        database: process.env.POSTGRES_DB,
        host: 'db',//process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        //tables
        entities:[User, Block, Chatroom, Friend, Match, Message, PendingInvitation, UserChatroom, TwoFaCode],
        synchronize: true,
      }),
    UserModule,
    BlockModule,
    ChatroomModule,
    FriendModule,
    MatchModule,
    MessageModule,
    PendingInvitationModule,
    TwoFaCodeModule,
    UserChatroomModule,
    GameModule,
    ChatModule,
    AuthModule,
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    }),
    GeneralUpdateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
