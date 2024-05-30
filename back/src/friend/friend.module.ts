import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Friend} from "../entities/friend.entity";
import {User} from "../entities/user.entity";
import {UserController} from "../user/user.controller";
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";
import {FriendController} from "./friend.controller";
import {FriendService} from "./friend.service";
import { JwtGuard } from "src/auth/guards/JwtGuards";

@Module({
    imports: [TypeOrmModule.forFeature([Friend, User])],
    controllers: [FriendController, UserController],
    providers: [FriendService, UserService, JwtService, JwtGuard]
})
export class FriendModule {}