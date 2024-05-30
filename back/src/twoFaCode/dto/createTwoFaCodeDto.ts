import {IsNotEmpty, IsNumber} from "class-validator";

export class CreateTwoFaCodeDto {

    @IsNumber()
    @IsNotEmpty()
    user_id: number;

    @IsNumber()
    @IsNotEmpty()
    code: number;
}

export class UpdateTwoFaCodeDto {
    @IsNumber()
    @IsNotEmpty()
    code: number;
}

export class CheckTwoFaCode
{
    @IsNumber()
    @IsNotEmpty()
    code: number;
}