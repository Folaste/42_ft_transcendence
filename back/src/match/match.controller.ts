import { Body, Controller, Get, Post, Param } from "@nestjs/common";
import { MatchService } from "./match.service";
import { CreateMatchDto } from "./dto/createMatchDto";

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Post()
    create(@Body() createMatchDto: CreateMatchDto)
    {
        return this.matchService.create(createMatchDto);
    }

    @Get(':login42')
    findMatchesFromLogin42(@Param('login42') login42:string)
    {
        return this.matchService.getMatchesFromUserLogin42(login42);
    }

    @Get("/count/:id")
    findCountMatchesWonAndLoseFromId(@Param('id') id: number ) {
        return this.matchService.getCountMatchesWonAndLoseById(id);
    }

    @Get("/win/:id")
    findCountMatchesWinFromId(@Param('id') id: number ) {
        return this.matchService.getCountMatchesWonById(id);
    }

    @Get("/lose/:id")
    findCountMatchesLostFromId(@Param('id') id: number ) {
        return this.matchService.getCountMatchesLostById(id);
    }

}