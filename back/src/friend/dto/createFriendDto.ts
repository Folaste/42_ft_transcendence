import {IsNotEmpty, IsNumber} from "class-validator";

export class CreateFriendDto {
    @IsNumber()
    @IsNotEmpty()
    idLeft: number;

    @IsNumber()
    @IsNotEmpty()
    idRight: number;
}

export class DeleteFriendDto
{
    @IsNumber()
    @IsNotEmpty()
    idOne: number;

    @IsNumber()
    @IsNotEmpty()
    idTwo: number;
}