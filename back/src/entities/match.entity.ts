import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm";
import {User} from "./user.entity";

@Entity("Match")
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: false})
    power_ups: boolean;

    @CreateDateColumn()
    date: Date;

    @ManyToOne(() => User, user => user.matches_right)
    player_left: User;

    @Column()
    score_left: number;

    @Column()
    victory_left: boolean;

    @Column()
    disconnected_left: boolean;

    @ManyToOne(() => User, user => user.matches_left)
    player_right: User;

    @Column()
    score_right: number;

    @Column()
    victory_right: boolean;

    @Column()
    disconnected_right: boolean;
}