import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Match } from '../entities/match.entity';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import {User} from "../entities/user.entity";
import {UserController} from "../user/user.controller";
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([Match, User])],
    controllers: [MatchController, UserController],
    providers: [MatchService, UserService, JwtService]
})
export class MatchModule {}