import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn} from "typeorm";
import { User } from "./user.entity";
import { Chatroom } from "./chatroom.entity";

@Entity("Message")
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @CreateDateColumn()
    posted_at: Date;

    @ManyToOne(() => User, user => user.messages)
    author: User;

    @ManyToOne(() => Chatroom, chatroom => chatroom.messages)
    @JoinColumn({ name: 'chatroomId' })
    chatroom: Chatroom;
}