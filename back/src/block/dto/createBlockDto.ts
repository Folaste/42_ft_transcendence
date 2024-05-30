import {IsNotEmpty, IsNumber} from "class-validator";

export class CreateBlockDto {

    @IsNumber()
    @IsNotEmpty()
    blocking_user_id: number;

    @IsNumber()
    @IsNotEmpty()
    blocked_user_id: number;
}