import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserChatroom } from "../entities/userchatroom.entity";
import { Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { ChatroomService } from "../chatroom/chatroom.service";
import { CreateUserchatroomDto } from "./dto/createUserchatroomDto";
import {UpdateUserchatroomDto} from "./dto/updateUserchatroomDto";

@Injectable()
export class UserChatroomService {

    constructor(
        @InjectRepository(UserChatroom)
        private readonly userchatroomRepo: Repository<UserChatroom>,
        private readonly userService: UserService,
        private readonly chatroomService: ChatroomService
    ) {}

    async create(createUserChatroomDto: CreateUserchatroomDto) {
        const { userId, chatroomId, isOwner, isAdmin, isMuted, isBanned } = createUserChatroomDto;
        const [ user, chatroom ] = await Promise.all([
            this.userService.findUserById(userId),
            this.chatroomService.findChatroomById(chatroomId)
        ]);

        if (!user) {
            throw new NotFoundException(`User with Username ${userId} not found.`);
        }

        if (!chatroom) {
            throw new NotFoundException(`Chatroom with ID ${chatroomId} not found.`);
        }

        const userChatroom = new UserChatroom();
        userChatroom.user = user;
        userChatroom.chatroom = chatroom;
        userChatroom.is_owner = isOwner;
        userChatroom.is_admin = isAdmin;
        userChatroom.is_muted = isMuted;
        userChatroom.is_banned = isBanned;

        return await this.userchatroomRepo.save(userChatroom);
    }

    async update(id: number, updateChatRoomUserDto: UpdateUserchatroomDto)
    {
        return await this.userchatroomRepo.update(id, updateChatRoomUserDto);
    }

    async get(userId: number, chatroomId: number)
    {
        return await this.userchatroomRepo
                .createQueryBuilder('userChatroom')
                .leftJoinAndSelect('userChatroom.user', 'user')
                .leftJoinAndSelect('userChatroom.chatroom', 'chatroom')
                .where('user.id =:userId AND chatroom.id = :chatroomId', {userId:userId, chatroomId:chatroomId})
                .getOne();
    }

    async delete(id: number) {
        return await this.userchatroomRepo.delete(id);
    }
}