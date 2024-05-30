import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn} from "typeorm";
import { User } from "./user.entity";

@Entity('TwoFaCode')
export class TwoFaCode
{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    code:number;

    @UpdateDateColumn()
    date:Date;

    @OneToOne(() => User)
    @JoinColumn()
    user:User;
}