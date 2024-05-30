import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn} from "typeorm";
import { UserChatroom } from "./userchatroom.entity";
import  { Message } from "./message.entity";
import {PendingInvitation} from "./pendingInvitation.entity";

@Entity("Chatroom")
export class Chatroom {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, nullable: false})
    name: string;

    @Column()
    hashed_pwd: string;

    @Column()
    type: string;

    @OneToMany(() => UserChatroom, userChatroom => userChatroom.chatroom, {cascade: true})
    @JoinColumn()
    userChatroom: UserChatroom[];

    @OneToMany(() => Message, message => message.chatroom, {cascade: true})
    @JoinColumn()
    messages: Message[];

    @OneToMany(() => PendingInvitation, invitation => invitation.chatroom)
    invitations: PendingInvitation[];
}