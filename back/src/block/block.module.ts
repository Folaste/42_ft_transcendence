import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Block} from "../entities/block.entity";
import {User} from "../entities/user.entity";
import {UserController} from "../user/user.controller";
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";
import {JwtGuard} from "../auth/guards/JwtGuards";
import {BlockService} from "./block.service";
import {BlockController} from "./block.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Block, User])],
    controllers: [BlockController, UserController],
    providers: [BlockService, UserService, JwtService, JwtGuard]
})
export class BlockModule {}