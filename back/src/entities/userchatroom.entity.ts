import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm";
import { User } from './user.entity'
import { Chatroom } from './chatroom.entity'

@Entity("User_Chatroom")
export class UserChatroom {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: false})
    is_owner: boolean;

    @Column({default: false})
    is_admin: boolean;

    @Column({default: false})
    is_muted: boolean;

    @Column({default: null, nullable: true})
    muted_timer: Date;

    @Column({default: false})
    is_banned: boolean;

    @ManyToOne(() => User, user => user.userChatrooms, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Chatroom, chatroom => chatroom.userChatroom, { eager: true })
    chatroom: Chatroom;
}