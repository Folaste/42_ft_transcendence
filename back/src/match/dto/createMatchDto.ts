import {IsBoolean, IsNotEmpty, IsNumber, Max} from "class-validator";

export class CreateMatchDto {
    @IsBoolean()
    powerUps: boolean;

    @IsNumber()
    @IsNotEmpty()
    playerLeftId: number;

    @IsNumber()
    @Max(5)
    scoreLeft: number;

    @IsBoolean()
    victoryLeft: boolean;

    @IsBoolean()
    disconnectedLeft: boolean;

    @IsNumber()
    @IsNotEmpty()
    playerRightId: number;

    @IsNumber()
    @Max(5)
    scoreRight: number;

    @IsBoolean()
    victoryRight: boolean;

    @IsBoolean()
    disconnectedRight: boolean;
}