import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { Block } from "./block.entity"
import { UserChatroom } from "./userchatroom.entity";
import { Message } from "./message.entity";
import { TwoFaCode } from './twoFaCode.entity';
import {Match} from "./match.entity";
import {Friend} from "./friend.entity";
import {PendingInvitation} from "./pendingInvitation.entity";

@Entity("User")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, nullable: false})
    login42: string;

    @Column({unique: true, nullable: false})
    nickname: string;

    @Column({default: false})
    auth2F: boolean;

    @Column({default: 'avatar.png'})
    avatarURI: string;

    @Column()
    email:string;

    @OneToMany(() => Block, blocked => blocked.blockingUser)
    blockedUsers: Block[];

    @OneToMany(() => Block, blocked => blocked.blockedUser)
    blockedByUsers: Block[];

    @OneToMany(() => UserChatroom, userChatroom => userChatroom.user)
    userChatrooms: UserChatroom[];

    @OneToMany(() => Message, message => message.author)
    messages: Message[]

    @OneToMany(() => Match, match => match.player_left)
    matches_right: Match[];

    @OneToMany(() => Match, match => match.player_right)
    matches_left: Match[];

    @OneToMany(() => Friend, friend => friend.user_left)
    friends_right: Friend[];

    @OneToMany(() => Friend, friend => friend.user_right)
    friends_left: Friend[];

    @OneToMany(() => PendingInvitation, invitation => invitation.chatroom)
    invitations: PendingInvitation[];

    @OneToOne(() => TwoFaCode)
    @JoinColumn()
    twoFaCode:TwoFaCode;
}

export class leaderboard {
    ranking:number;
    totalMatches:number;
    totalVictories:number;
    user:User;
}