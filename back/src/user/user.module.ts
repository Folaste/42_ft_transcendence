import { Module } from '@nestjs/common';
import { UserController} from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtGuard } from 'src/auth/guards/JwtGuards';
import { JwtService } from '@nestjs/jwt';
import { FriendService } from 'src/friend/friend.service';
import { Friend } from 'src/entities/friend.entity';
import { FriendController } from 'src/friend/friend.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend])],
  controllers: [UserController, FriendController],
  providers: [UserService, JwtService, FriendService, JwtGuard]
})
export class UserModule {}
