import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "../entities/message.entity";
import { Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { ChatroomService } from "../chatroom/chatroom.service";
import { CreateMessageDto } from "./dto/createMessageDto";
import { UserChatroom } from "src/entities/userchatroom.entity";

@Injectable()
export class MessageService {

    constructor(
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
        private readonly userService: UserService,
        private readonly chatroomService: ChatroomService
    ) {}

    async create(createMessageDto: CreateMessageDto) {
        const { content, authorId, chatroomId } = createMessageDto;
        const [ author, chatroom] = await Promise.all([
            this.userService.findUserById(authorId),
            this.chatroomService.findChatroomById(chatroomId)
        ]);

        if (!author) {
            throw new NotFoundException(`User with ID ${authorId} not found.`);
        }

        if (!chatroom) {
            throw new NotFoundException(`Chatroom with ID ${chatroomId} not found.`);
        }

        const usersChatroom:UserChatroom[] = await this.chatroomService.getAllUsersFromChatroomId(chatroomId);
        let userIsInChatroom:boolean = false;

        for (const elem of usersChatroom)
        {
            if (elem.user.id === author.id)
                userIsInChatroom = true;
        }

        if (userIsInChatroom === false)
            return null;

        const message = new Message();
        message.content = content;
        message.author = author;
        message.chatroom = chatroom;

        return await this.messageRepo.save(message);
    }

    async getAllMessageFromChatroomId(chatroomId: number)
    {
        return await this.messageRepo
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.chatroom', 'chatroom')
            .leftJoinAndSelect('message.author', 'auhtor')
            .where('chatroom.id = :chatroomId', {chatroomId: chatroomId})
            .orderBy('message.posted_at')
            .getMany();
    }

}