import {Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {Chatroom} from "./chatroom.entity";

@Entity("PendingInvitation")
export class PendingInvitation {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.invitations)
    user: User;

    @ManyToOne(() => Chatroom, chatroom => chatroom.invitations)
    chatroom: Chatroom;
}