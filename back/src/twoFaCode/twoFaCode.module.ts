import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {TwoFaCode} from "../entities/twoFaCode.entity";
import {TwoFaCodeService} from "./twoFaCode.service";
import {UserService} from "../user/user.service";
import {UserController} from "../user/user.controller";
import {TwoFaCodeController} from "./twoFaCode.controller";
import {JwtService} from "@nestjs/jwt";
import {User} from "../entities/user.entity";
import {JwtGuard} from "../auth/guards/JwtGuards";

@Module({
    imports: [TypeOrmModule.forFeature([TwoFaCode, User])],
    controllers: [TwoFaCodeController, UserController],
    providers: [TwoFaCodeService, UserService, JwtService, JwtGuard]
})
export class TwoFaCodeModule {}