import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity'

@Entity("Block")
export class Block {
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(() => User, user => user.blockedUsers)
    blockingUser: User;

    @ManyToOne(() => User, user => user.blockedByUsers)
    blockedUser: User;
}