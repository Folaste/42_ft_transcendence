import {Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";

@Entity("Friend")
export class Friend {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.friends_right)
    user_left: User;

    @ManyToOne(() => User, user => user.friends_left)
    user_right: User;
}