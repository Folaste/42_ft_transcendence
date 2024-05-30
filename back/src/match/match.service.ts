import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match }  from "../entities/match.entity";
import { CreateMatchDto } from "./dto/createMatchDto";
import {UserService} from "../user/user.service";

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
        private readonly userService: UserService
    ) {}

    async create(createMatchDto: CreateMatchDto) {
        const { powerUps, playerLeftId, scoreLeft, victoryLeft, disconnectedLeft, playerRightId, scoreRight, victoryRight, disconnectedRight } = createMatchDto;
        const [ player_left, player_right ] = await Promise.all([
            this.userService.findUserById(playerLeftId),
            this.userService.findUserById(playerRightId)
        ]);

        if (!player_left) {
            throw new NotFoundException(`User with ID ${playerLeftId} not found.`);
        }

        if (!player_right) {
            throw new NotFoundException(`User with ID ${playerRightId} not found.`);
        }

        if (player_left === player_right) {
            throw new ForbiddenException(`There is same users.`);
        }

        const match = new Match();
        match.power_ups = powerUps;
        match.player_left = player_left;
        match.score_left = scoreLeft;
        match.victory_left = victoryLeft;
        match.disconnected_left = disconnectedLeft;
        match.player_right = player_right;
        match.score_right = scoreRight;
        match.victory_right = victoryRight;
        match.disconnected_right = disconnectedRight;

        return this.matchRepo.save(match);
    }

    async getMatchesFromUserLogin42(login42: string){
        return this.matchRepo
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.player_left', 'player_left')
        .leftJoinAndSelect('match.player_right', 'player_right')
        .where('player_left.login42 = :login42 OR player_right.login42 = :login42', {login42})
        .getMany()
    }

    async getCountMatchesWonAndLoseById(id: number) {
        const count_win = await this.matchRepo
            .createQueryBuilder('match')
            .leftJoinAndSelect('match.player_left', 'player_left')
            .leftJoinAndSelect('match.player_right', 'player_right')
            .where('player_left.id = :id AND match.victory_left = true', {id})
            .orWhere('player_right.id = :id AND match.victory_right = true', {id})
            .getCount();

        const count_lose = await this.matchRepo
            .createQueryBuilder('match')
            .leftJoinAndSelect('match.player_left', 'player_left')
            .leftJoinAndSelect('match.player_right', 'player_right')
            .where('player_left.id = :id AND match.victory_left = false', {id})
            .orWhere('player_right.id = :id AND match.victory_right = false', {id})
            .getCount();

        return {count_win, count_lose};
    }

    async getCountMatchesWonById(id: number) {
        return await this.matchRepo
            .createQueryBuilder('match')
            .leftJoinAndSelect('match.player_left', 'player_left')
            .leftJoinAndSelect('match.player_right', 'player_right')
            .where('player_left.id = :id AND match.victory_left = true', {id})
            .orWhere('player_right.id = :id AND match.victory_right = true', {id})
            .getManyAndCount()
    }
    async getCountMatchesLostById(id: number) {
        return await this.matchRepo
            .createQueryBuilder('match')
            .leftJoinAndSelect('match.player_left', 'player_left')
            .leftJoinAndSelect('match.player_right', 'player_right')
            .where('player_left.id = :id AND match.victory_left = false', {id})
            .orWhere('player_right.id = :id AND match.victory_right = false', {id})
            .getManyAndCount()
    }

}