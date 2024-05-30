import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chatroom } from "../entities/chatroom.entity";
import { CreateChatroomDto } from "./dto/createChatroomDto";
import { UpdateChatroomDto } from "./dto/updateChatroomDto";
import { UserChatroom } from "src/entities/userchatroom.entity";
import { UserService } from "src/user/user.service";
import { CreateUserchatroomDto } from "src/userChatroom/dto/createUserchatroomDto";
import * as Bcrypt from 'bcrypt'
import { User } from "src/entities/user.entity";

@Injectable()
export class ChatroomService {
    constructor(@InjectRepository(Chatroom)
        private readonly chatroomRepo: Repository<Chatroom>,
        private readonly userService: UserService,
                @InjectRepository(UserChatroom)
        private readonly userChatroomRepo: Repository<UserChatroom>) {}

    async findChatroomById(id:number)
    {
        return(await this.chatroomRepo.findOne({where:{id: id}, relations: ['messages']}));
    }

    async getChatroomByName(name:string)
    {
        return(await this.chatroomRepo.findOne({where:{name: name}}));
    }

    async create(createChatroomDto: CreateChatroomDto)
    {
        const chatroom = await this.chatroomRepo.create(createChatroomDto);
        return await this.chatroomRepo.save(chatroom);
    }

    async createChatroom(chatroomInfos: CreateChatroomDto)
    {
        if (chatroomInfos && chatroomInfos.type === "DM")
        {
            let name: string;
            if (chatroomInfos?.userId_1 < chatroomInfos?.userId_2)
                name = chatroomInfos.userId_1 + "_" + chatroomInfos.userId_2;
            else
                name = chatroomInfos.userId_2 + "_" + chatroomInfos.userId_1;
            let chatroomDM: CreateChatroomDto = {
                hashed_pwd: chatroomInfos.hashed_pwd,
                type: chatroomInfos.type,
                name: name,
            };
            const createdChatroom = await this.chatroomRepo.create(chatroomDM);
            await this.chatroomRepo.save(createdChatroom);

            const [ user1, user2 ] = await Promise.all([
                this.userService.findUserById(chatroomInfos.userId_1),
                this.userService.findUserById(chatroomInfos.userId_2),
            ]);

            if (!user1 || !user2)
                throw("One of the two Users doesn't exist");
    
            const userChatroom_1 = new UserChatroom();
            userChatroom_1.user = user1;
            userChatroom_1.chatroom = createdChatroom;
            userChatroom_1.is_owner = false;
            userChatroom_1.is_admin = false;
            userChatroom_1.is_muted = false;
            userChatroom_1.is_banned = false;
            await this.userChatroomRepo.save(userChatroom_1)

            const userChatroom_2 = new UserChatroom();
            userChatroom_2.user = user2;
            userChatroom_2.chatroom = createdChatroom;
            userChatroom_2.is_owner = false;
            userChatroom_2.is_admin = false;
            userChatroom_2.is_muted = false;
            userChatroom_2.is_banned = false;
            await this.userChatroomRepo.save(userChatroom_2)
            
            return createdChatroom;
        }
        else
        {
            if (chatroomInfos.type === "protected"){
                await Bcrypt.hash(chatroomInfos.hashed_pwd, 10).then(res=>{chatroomInfos.hashed_pwd = res}).catch(()=>{});
            }
            let chatroomALL: CreateChatroomDto = {
                hashed_pwd: chatroomInfos.hashed_pwd,
                type: chatroomInfos.type,
                name: chatroomInfos.name,
            };
            try 
            {
                const createdChatroom = await this.chatroomRepo.create(chatroomALL);
                await this.chatroomRepo.save(createdChatroom);
    
                const [ user1,] = await Promise.all([
                    this.userService.findUserById(chatroomInfos.userId_1),
                ]);
    
                if (!user1)
                    throw("The User doesn't exist");
    
                const userChatroom_1 = new UserChatroom();
                userChatroom_1.user = user1;
                userChatroom_1.chatroom = createdChatroom;
                userChatroom_1.is_owner = true;
                userChatroom_1.is_admin = false;
                userChatroom_1.is_muted = false;
                userChatroom_1.is_banned = false;
                await this.userChatroomRepo.save(userChatroom_1)
                return createdChatroom;
            }
            catch {
                throw new BadRequestException("Impossible to create this chatroom");
            }
        }
    }

    async joinChatroom(chatroomInfo: CreateUserchatroomDto){
        const [ chatroom, user ] = await Promise.all([
            this.chatroomRepo.createQueryBuilder('chatroom')
                .where('chatroom.id = :chatroomId', {chatroomId: chatroomInfo.chatroomId})
                .leftJoinAndSelect('chatroom.invitations', 'invitations')
                .leftJoinAndSelect('invitations.user', 'user')
                .getOne(),
            this.userService.findUserById(chatroomInfo.userId)
        ]);

        if (chatroom.type === "protected"){
            await Bcrypt.compare(chatroomInfo?.password, chatroom.hashed_pwd)
                .then(async res => {
                    if (res === true){
                        const userChatroom_1 = new UserChatroom();
                        userChatroom_1.user = user;
                        userChatroom_1.chatroom = chatroom;
                        userChatroom_1.is_owner = false;
                        userChatroom_1.is_admin = false;
                        userChatroom_1.is_muted = false;
                        userChatroom_1.is_banned = false;
                        return await this.userChatroomRepo.save(userChatroom_1)
                    }
                })
                .catch(()=>{});
            return ;
        }

        if (chatroom.type === "private")
        {
            const usersInvited:number[] = [];
            for (const elem of chatroom.invitations)
                usersInvited.push(elem.user.id)
            if (usersInvited.includes(user.id) === false)
                return null;
        }

        const userChatroomAlreadyExist = await this.userChatroomRepo
            .createQueryBuilder('userChatroom')
            .leftJoinAndSelect('userChatroom.user', 'user')
            .leftJoinAndSelect('userChatroom.chatroom', 'chatroom')
            .where('user.id = :userId AND chatroom.id = :chatroomId', {userId: user.id, chatroomId: chatroom.id})
            .getOne()
        if (userChatroomAlreadyExist)
            return ;

        const userChatroom_1 = new UserChatroom();
        userChatroom_1.user = user;
        userChatroom_1.chatroom = chatroom;
        userChatroom_1.is_owner = false;
        userChatroom_1.is_admin = false;
        userChatroom_1.is_muted = false;
        userChatroom_1.is_banned = false;
        return await this.userChatroomRepo.save(userChatroom_1)
    }

    async update(id: number, updateChatroomDto: UpdateChatroomDto)
    {
        if (updateChatroomDto.type === "protected"){
            await Bcrypt.hash(updateChatroomDto.hashed_pwd, 10).then(res=>{updateChatroomDto.hashed_pwd = res}).catch(()=>{});
        }
        else
            updateChatroomDto.hashed_pwd = "";

        return await this.chatroomRepo.update(id, updateChatroomDto);
    }

    async delete(id: number)
    {
        return await this.chatroomRepo.delete(id);
    }

    async getChatroomWithMessages(chatroomId: number) {
        return await this.chatroomRepo
          .createQueryBuilder('chatroom')
          .leftJoinAndSelect('chatroom.messages', 'message')
          .where('chatroom.id = :chatroomId', { chatroomId })
          .getOne();
    }

    async getAllChatrooms() {
        return await this.chatroomRepo
          .createQueryBuilder('chatroom')
          .leftJoinAndSelect('chatroom.messages', 'message')
          .leftJoinAndSelect('chatroom.userChatroom', 'userChatroom')
          .leftJoinAndSelect('userChatroom.chatroom', 'chatrooms')
          .getMany();
    }

    async getDirectMessagesFromUserId(userId: number){
        return await this.chatroomRepo
            .createQueryBuilder('chatroom')
            .leftJoinAndSelect('chatroom.userChatroom', 'userChatroom')
            .leftJoinAndSelect('chatroom.userChatroom', 'chatroomUserChatroom')
            .leftJoinAndSelect('chatroomUserChatroom.user', 'user')
            .where('chatroom.type = :type')
            .andWhere('userChatroom.user = :userId', { type: "DM", userId })
            .andWhere('chatroomUserChatroom.user != :userId', {userId})
            .orderBy('user.nickname')
            .getMany();
    }

    async getChatroomsFromUserId(userId: number){
        return await this.chatroomRepo
            .createQueryBuilder('chatroom')
            .where('chatroom.type != :type', { type: "DM" })
            .leftJoinAndSelect('chatroom.userChatroom', 'userChatroom')
            .andWhere('userChatroom.user = :userId', { userId: userId })
            .leftJoinAndSelect('chatroom.userChatroom', 'userChatrooms')
            .andWhere('user.id = :userId', { userId })
            .leftJoinAndSelect('userChatrooms.user', 'user')
            .andWhere('userChatrooms.is_banned = false') // Condition pour exclure les chatrooms où l'utilisateur est banni
            .orderBy('chatroom.name')
            .getMany();
            

    }

    async getAllPublicChatroomsButFromUserId(userId: number){
        const allPublicChatrooms = await this.chatroomRepo
            .createQueryBuilder('chatroom')
            .where('chatroom.type = :type', {type: "public"})
            .orderBy('chatroom.name')
            .getMany();
        
        const allPublicdUserChatroomsFromUserId = await this.userChatroomRepo
            .createQueryBuilder('userChatroom')
            .leftJoinAndSelect('userChatroom.user', 'user')
            .leftJoinAndSelect('userChatroom.chatroom', 'chatroom')
            .where('chatroom.type = :type AND user.id = :id', {type: "public", id: userId})
            .orderBy('chatroom.id')
            .getMany();

        const publicChatroomAlreadyJoined:number[] = [];

        allPublicdUserChatroomsFromUserId.forEach((userChatroom) => {
            publicChatroomAlreadyJoined.push(userChatroom.chatroom.id)
        })

        const publicChatroomsToDisplay:Chatroom[] = [];

        allPublicChatrooms.forEach((chatroom) => {
            if (publicChatroomAlreadyJoined.includes(chatroom.id) === false)
                publicChatroomsToDisplay.push(chatroom);
        })

        return (publicChatroomsToDisplay);
    }

    async getAllProtectedChatroomsButFromUserId(userId: number){
        const allProtectedChatrooms = await this.chatroomRepo
            .createQueryBuilder('chatroom')
            .where('chatroom.type = :type', {type: "protected"})
            .orderBy('chatroom.name')
            .getMany();
        
        const allProtectedUserChatroomsFromUserId = await this.userChatroomRepo
            .createQueryBuilder('userChatroom')
            .leftJoinAndSelect('userChatroom.user', 'user')
            .leftJoinAndSelect('userChatroom.chatroom', 'chatroom')
            .where('chatroom.type = :type AND user.id = :id', {type: "protected", id: userId})
            .orderBy('chatroom.id')
            .getMany();

        const protectedChatroomAlreadyJoined:number[] = [];

        allProtectedUserChatroomsFromUserId.forEach((userChatroom) => {
            protectedChatroomAlreadyJoined.push(userChatroom.chatroom.id)
        })

        const protectedChatroomsToDisplay:Chatroom[] = [];

        allProtectedChatrooms.forEach((chatroom) => {
            if (protectedChatroomAlreadyJoined.includes(chatroom.id) === false)
                protectedChatroomsToDisplay.push(chatroom);
        })

        return (protectedChatroomsToDisplay);
    }

    async getAllPrivateChatroomsButFromUserId(userId: number){
        const allPrivateChatrooms = await this.chatroomRepo
            .createQueryBuilder('chatroom')
            .where('chatroom.type = :type', {type: "private"})
            .orderBy('chatroom.name')
            .getMany();
        
        const allPrivateUserChatroomsFromUserId = await this.userChatroomRepo
            .createQueryBuilder('userChatroom')
            .leftJoinAndSelect('userChatroom.user', 'user')
            .leftJoinAndSelect('userChatroom.chatroom', 'chatroom')
            .where('chatroom.type = :type AND user.id = :id', {type: "private", id: userId})
            .getMany();

        const privateChatroomsToDisplay:Chatroom[] = [];

        allPrivateChatrooms.forEach((chatroom) => {
            allPrivateUserChatroomsFromUserId.forEach((userChatroomFromUser) => {
                if (userChatroomFromUser.chatroom.id !== chatroom.id)
                    privateChatroomsToDisplay.push(chatroom);
            })
        })

        return (privateChatroomsToDisplay);
    }

    async getAllUsersFromChatroomId(chatroomId:number){
        return await this.userChatroomRepo
            .createQueryBuilder('userChatroom')
            .where('userChatroom.chatroomId = :chatroomId', {chatroomId})
            .leftJoinAndSelect('userChatroom.user', 'user')
            .getMany();
    }

    async getAllUsersButFromChatroomId(chatroomId:number){
        const chatroom =  await this.chatroomRepo
            .createQueryBuilder('chatroom')
            .where('chatroom.id = :chatroomId', {chatroomId})
            .leftJoinAndSelect('chatroom.userChatroom', 'userChatroom')
            .leftJoinAndSelect('userChatroom.user', 'user')
            .getOne();
        const chatroomUsersId:number[] = [];
        chatroom.userChatroom.forEach((userChatroom) => {
            if (chatroomUsersId.includes(userChatroom.user.id) === false)
                chatroomUsersId.push(userChatroom.user.id);
        })

        const allUsers = await this.userService.getAllUSers();
        const allUsersId:number[] = [];
        allUsers.forEach((user) => {
            if (chatroomUsersId.includes(user.id) === false)
                allUsersId.push(user.id);
        })

        const restUsers:User[] = [];
        allUsers.forEach((user) => {
            if (allUsersId.includes(user.id) === true)
                restUsers.push(user);
        })

        return restUsers;
    }
}