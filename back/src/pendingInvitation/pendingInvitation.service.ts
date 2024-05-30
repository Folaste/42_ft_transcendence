import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {PendingInvitation} from "../entities/pendingInvitation.entity";
import {Repository} from "typeorm";
import {UserService} from "../user/user.service";
import {ChatroomService} from "../chatroom/chatroom.service";
import {CreatePendingInvitationDto} from "./dto/createPendingInvitationDto";

@Injectable()
export class PendingInvitationService {

    constructor(
        @InjectRepository(PendingInvitation) private readonly pendingInvitationRepo: Repository<PendingInvitation>,
        private readonly userService: UserService,
        private readonly chatroomService: ChatroomService
    ) {}

    async create(createPendingInvitationDto: CreatePendingInvitationDto) {
        const { userId, chatroomId } = createPendingInvitationDto;
        const [ user, chatroom ] = await Promise.all([
            this.userService.findUserById(userId),
            this.chatroomService.findChatroomById(chatroomId)
        ]);

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found.`);
        }

        if (!chatroom) {
            throw new NotFoundException(`Chatroom with ID ${chatroom} not found.`);
        }

        const searchInvitation = await this.getFromUserIdAndChatroomId(userId, chatroomId);
        if (searchInvitation)
            return searchInvitation;

        const invitation = new PendingInvitation();
        invitation.user = user;
        invitation.chatroom = chatroom;

        return await this.pendingInvitationRepo.save(invitation);
    }

    async getFromUserId(userId: number){
        return await this.pendingInvitationRepo
            .createQueryBuilder('pendingInvitation')
            .leftJoinAndSelect('pendingInvitation.user', 'user')
            .leftJoinAndSelect('pendingInvitation.chatroom', 'chatroom')
            .where('user.id = :userId', {userId: userId})
            .getMany();
    }

    async getFromUserIdAndChatroomId(userId: number, chatroomId: number){
        return await this.pendingInvitationRepo
            .createQueryBuilder('pendingInvitation')
            .leftJoinAndSelect('pendingInvitation.user', 'user')
            .leftJoinAndSelect('pendingInvitation.chatroom', 'chatroom')
            .where('user.id = :userId AND chatroom.id = :chatroomId', {userId: userId, chatroomId: chatroomId})
            .getOne();
    }

    async delete(id: number) {
        return await this.pendingInvitationRepo.delete(id);
    }

    async deleteByChatroomAndUserId(userId: number, chatroomId:number) {

        try{
            const toRemove = await this.pendingInvitationRepo
            .createQueryBuilder('pendingInvitation')
            .leftJoinAndSelect('pendingInvitation.user', 'user')
            .leftJoinAndSelect('pendingInvitation.chatroom', 'chatroom')
            .where('user.id = :userId AND chatroom.id = :chatroomId', {userId: userId, chatroomId: chatroomId})
            .getOne();
            return await this.pendingInvitationRepo.delete(toRemove.id);
        }
        catch{
            throw new BadRequestException("Impossible to delete this invitation");
        }
        
    }

    async deleteAllOnChatroom(chatroomId: number){
        const allInvitationsOfChatroom = await this.pendingInvitationRepo
            .createQueryBuilder('pendingInvitation')
            .leftJoinAndSelect('pendingInvitation.chatroom', 'chatroom')
            .where('chatroom.id = :chatroomId', {chatroomId: chatroomId})
            .getMany();

        for (const elem of allInvitationsOfChatroom)
            await this.pendingInvitationRepo.delete(elem.id);
        return ;
    }
}