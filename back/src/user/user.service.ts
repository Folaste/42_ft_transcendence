import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/createUserDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, leaderboard } from '../entities/user.entity';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}
    
    async getAllUSers(){
        return await this.userRepo.createQueryBuilder('user').getMany();
    }

    async findUserById(id:number){
        return(await this.userRepo.findOne({where:{id: id}}));
    }

    async findUserByUsername(username:string){
        const user = await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.blockedUsers', 'blockedUsers')
            .leftJoinAndSelect('blockedUsers.blockedUser', 'userBlocked')
            .where('user.login42 = :login42', {login42: username})
            .getOne()
        return user;
    }

    async create(createUserDto: CreateUserDto)
    {
        const user = await this.userRepo.create(createUserDto);
        return await this.userRepo.save(user);
    }

    async update (id:number, updateUserDto:UpdateUserDto)
    {
        try {
            const user = await this.userRepo.update(id, updateUserDto);
            return user;
        }
        catch {
            throw new BadRequestException('Can\'t update user');
        }
    }

    async save (id:number, user:User)
    {
        return await this.userRepo.save(user);
    }

    async getAllUsersButUserId(userId:number) {
        return await this.userRepo
            .createQueryBuilder('user')
            .where('user.id != :userId', { userId })
            .orderBy('user.login42')
            .getMany();
    }

    async getAllUsersWithNoDirectMessageWithUserId(userId:number) {
        let user = await this.userRepo
            .createQueryBuilder('user')
            .where('user.id = :userId', { userId })
            .leftJoinAndSelect('user.userChatrooms', 'userChatrooms')
            .leftJoinAndSelect('userChatrooms.chatroom', 'chatroom')
            .andWhere('chatroom.type = :type', {type: "DM"})
            .leftJoinAndSelect('chatroom.userChatroom', 'usersChatrooms')
            .leftJoinAndSelect('usersChatrooms.user', 'users')
            .andWhere('users.id != :userId', {userId: userId})
            .getOne();

        if (user === null)
        {
            user = await this.userRepo
                .createQueryBuilder('user')
                .where('user.id = :userId', { userId })
                .getOne();
        }

        const usersIdWithDirectMessage:number[] = [];
        user.userChatrooms?.forEach((userChatroom) => {
            usersIdWithDirectMessage.push(userChatroom.chatroom.userChatroom[0].user.id);
        })

        const allUsers = await this.userRepo
            .createQueryBuilder('user')
            .where('user.id != :userId', {userId: userId})
            .getMany()

        const usersToStartDirectMessageWith:User[] = [];
        allUsers?.forEach((user) => {
            if (usersIdWithDirectMessage.includes(user.id) === false)
            usersToStartDirectMessageWith.push(user);
        })
        return (usersToStartDirectMessageWith);
    }

    async getAllInfoFromUsername(username: string)
    {
        return await this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.matches_left', 'matches_left')
            .leftJoinAndSelect('user.matches_right', 'matches_right')
            .leftJoinAndSelect('matches_right.player_right', 'player_right')
            .leftJoinAndSelect('matches_left.player_left', 'player_left')
            .leftJoinAndSelect('user.friends_left', 'friends_left')
            .leftJoinAndSelect('user.friends_right', 'friends_right')
            .leftJoinAndSelect('friends_left.user_left', 'user_left')
            .leftJoinAndSelect('friends_right.user_right', 'user_right')
            .where('user.login42 = :login42', {login42: username})
            .getMany();
    }

    async getLeaderboard() {
        const allUsers = await this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.matches_left', 'matches_left')
            .leftJoinAndSelect('matches_left.player_left', 'left_player_left')
            .leftJoinAndSelect('matches_left.player_right', 'left_player_right')
            .leftJoinAndSelect('user.matches_right', 'matches_right')
            .leftJoinAndSelect('matches_right.player_left', 'right_player_left')
            .leftJoinAndSelect('matches_right.player_right', 'right_player_right')
            .getMany()

        const leaderboard:leaderboard[] = [];

        allUsers?.forEach((user) => {
            let totalUserMatches = 0;
            let totalUserVictories = 0;
            user.matches_left?.forEach((match) => {
                totalUserMatches++;
                if (match.player_left.id === user.id && match.victory_left === true)
                    totalUserVictories++;
                else if (match.player_right.id === user.id && match.victory_right === true)
                    totalUserVictories++;
            })
            user.matches_right?.forEach((match) => {
                totalUserMatches++;
                if (match.player_left.id === user.id && match.victory_left === true)
                    totalUserVictories++;
                if (match.player_right.id === user.id && match.victory_right === true)
                    totalUserVictories++;
            })
            const ranking = totalUserVictories / totalUserMatches;
            leaderboard.push({ranking: isNaN(ranking) ? -1 : ranking, totalMatches: totalUserMatches, totalVictories: totalUserVictories, user: user});
        })
        leaderboard.sort((a, b) => {
            if (a.ranking !== b.ranking) {
                if (isNaN(a.ranking)) return 1;
                if (isNaN(b.ranking)) return -1;
                return b.ranking - a.ranking;
            }
            return b.totalMatches - a.totalMatches;
        });
        const top3 = leaderboard.slice(0, 3);
        const top10 = leaderboard.slice(3, 7);
        return ({top3, top10});
    }

    async getAllUsersButUserIdAndFriends(userId:number) {
        const allUsers = await this.userRepo
            .createQueryBuilder('user')
            .where('user.id != :userId', {userId})
            .orderBy('user.login42')
            .getMany();

        return allUsers;
    }
}