import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {CreateFriendDto, DeleteFriendDto} from "./dto/createFriendDto";
import {InjectRepository} from "@nestjs/typeorm";
import {Friend} from "../entities/friend.entity";
import {Repository} from "typeorm";
import {UserService} from "../user/user.service";

@Injectable()
export class FriendService {

    constructor(
        @InjectRepository(Friend) private readonly friendRepo : Repository<Friend>,
        
        private readonly userService: UserService
    ) {}

    async create(createFriendDto: CreateFriendDto) {
        const {idLeft, idRight} = createFriendDto;
        const [user_left, user_right] = await Promise.all([
            this.userService.findUserById(idLeft),
            this.userService.findUserById(idRight)
        ]);

        if (!user_left) {
            throw new NotFoundException(`User with ID ${idLeft} not found.`);
        }

        if (!user_right) {
            throw new NotFoundException(`User with ID ${idRight} not found.`);
        }

        if (user_left === user_right) {
            throw new ForbiddenException(`Users cannot be the same.`);
        }

        const friendship = new Friend();
        friendship.user_left = user_left.id < user_right.id ? user_left : user_right;
        friendship.user_right = user_left.id < user_right.id ? user_right : user_left;

        const friends:CreateFriendDto = {
            idLeft : user_left.id < user_right.id ? user_left.id : user_right.id,
            idRight : user_left.id < user_right.id ? user_right.id : user_left.id
        }
        const friendsExists = await this.findFriendsByIds(friends);
        if (friendsExists)
            return;

        return await this.friendRepo.save(friendship);
    }

    async delete(id: number) {
        return await this.friendRepo.delete(id);
    }

    async getAllFriends(userId:number) {
        const allFriends = await this.friendRepo
        .createQueryBuilder('friend')
        .leftJoinAndSelect('friend.user_left', 'friend_left')
        .leftJoinAndSelect('friend.user_right', 'friend_right')
        .where('friend.user_left = :userId', {userId})
        .orWhere('friend.user_right = :userId', {userId})
        .getMany();

        let friends = allFriends.flatMap((friend) => {
            const { user_left, user_right } = friend; // Déstructuration des propriétés user_left et user_right
            return [user_left, user_right];
          });

        const allUser = await this.userService.getAllUsersButUserId(userId);

        const allUserButFriends = allUser.filter((utilisateur) => {
            return !friends.some((u) => u.id === utilisateur.id);
          });

        return allUserButFriends;
    }

    async deleteOneFriend(deleteFriendDto: DeleteFriendDto)
    {
        const friendRelation = await this.friendRepo.createQueryBuilder('friend')
        .where('friend.user_left = :idOne AND friend.user_right = :idTwo')
        .orWhere('friend.user_left = :idTwo AND friend.user_right = :idOne', {idOne: deleteFriendDto.idOne, idTwo: deleteFriendDto.idTwo}).getOne()
        
        return this.friendRepo.delete(friendRelation.id);
    }

    async findFriendsByIds(usersId:CreateFriendDto)
    {
        const friends = this.friendRepo
            .createQueryBuilder('friend')
            .leftJoinAndSelect('friend.user_left', 'userLeft')
            .leftJoinAndSelect('friend.user_right', 'userRight')
            .where('userLeft.id = :userId_left AND userRight.id = :userId_right', 
                {userId_left: usersId.idLeft < usersId.idRight ? usersId.idLeft : usersId.idRight,
                userId_right: usersId.idLeft < usersId.idRight ? usersId.idRight : usersId.idLeft})
            .getOne();

        return friends;
    }
}