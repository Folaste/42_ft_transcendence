import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Block} from "../entities/block.entity";
import {UserService} from "../user/user.service";
import {CreateBlockDto} from "./dto/createBlockDto";

@Injectable()
export class BlockService {

    constructor(
        @InjectRepository(Block) private readonly blockRepo: Repository<Block>,
        private readonly userService: UserService
    ) {}

    async create(createBlockDto: CreateBlockDto) {
        const { blocking_user_id, blocked_user_id } = createBlockDto;
        const [ blocking_user, blocked_user ] = await Promise.all([
            this.userService.findUserById(blocking_user_id),
            this.userService.findUserById(blocked_user_id)
        ]);

        const relation = await this.findFromUsersId(blocking_user_id, blocked_user_id);

        if (!blocking_user) {
            throw new NotFoundException(`User with ${blocking_user_id} not found.`);
        }
        else if (!blocked_user) {
            throw new NotFoundException(`User with ${blocked_user_id} not found.`);
        }
        else if (blocking_user_id === blocked_user_id) {
            throw new ForbiddenException(`Blocked user cannot be blocking user.`);
        }
        else if (relation) {
            throw new ForbiddenException(`Block relation already exists.`);
        }

        const block = new Block();
        block.blockedUser = blocked_user;
        block.blockingUser = blocking_user;

        return await this.blockRepo.save(block);
    }

    async delete(id: number) {
        return await this.blockRepo.delete(id);
    }

    async findFromUsersId(blockingUser:number, blockedUser: number) {
        const relation = await this.blockRepo
            .createQueryBuilder('block')
            .leftJoinAndSelect('block.blockingUser', 'blockingUser') 
            .leftJoinAndSelect('block.blockedUser', 'blockedUser')
            .where('blockingUser.id = :blockingUserID AND blockedUser.id = :blockedUserID', {blockingUserID: blockingUser, blockedUserID: blockedUser})
            .getOne();
        return relation;

    }

    async deleteFromUsers(blockingUser:number, blockedUser: number) {
        const relation = await this.findFromUsersId(blockingUser, blockedUser);
        if (relation)
            await this.blockRepo.remove(relation);
    }

    async getAllUsersBlocked(id:number)
    {
        return await this.blockRepo
        .createQueryBuilder('block')
        .leftJoinAndSelect('block.blockingUser', 'blockingUser') 
        .leftJoinAndSelect('block.blockedUser', 'blockedUser')
        .where('blockingUser.id = :id', {id})       
        .getMany();
    }
}