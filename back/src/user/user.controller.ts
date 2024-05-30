import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Request, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/createUserDto';
import { Response } from "express";
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guards/JwtGuards';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

function isNumberInString(param:any): boolean {
    return !isNaN(param);

}

@Controller('user')
export class UserController 
{
    constructor(private readonly userService:UserService){}

    @UseGuards(JwtGuard)
    @Get(':username')
    async findUser(@Request() req, @Param("username") username:string)
    {
        if (isNumberInString(username) === true)
        {
            let userId: number = +username;
            const user = await this.userService.findUserById(userId);
            if (!user)
                throw new UnauthorizedException();
            return user;
        }
        else
        {
            const user = await this.userService.findUserByUsername(username);
            if (!user)
                throw new UnauthorizedException();
            return user;
        }
    }

    @UseGuards(JwtGuard)
    @Get('/ranking/leaderboard')
    async getLeaderBoard(@Request() req) {
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        return await this.userService.getLeaderboard();
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto)
    {
        return this.userService.create(createUserDto);
    }

    @UseGuards(JwtGuard)
    @Put()
    async update(@Request() req, @Body() updateUserDto:UpdateUserDto)
    {
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        return this.userService.update(user.id, updateUserDto);
    }

    @UseGuards(JwtGuard)
    @Post('/changePicture/')
    @UseInterceptors(FileInterceptor('test', {
        storage: diskStorage({
            destination: './users_images',
            filename: (req, file, cb) => {
                cb(null, file.originalname + '_' + Date.now() + Math.floor(Math.random()) + '.png')
            }
        })
    }))
    async handleChangePicture(@UploadedFile(new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),) file: Express.Multer.File, @Request() req)
    {
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        const oldPicture = user.avatarURI;
        user.avatarURI = file.filename;
        await this.userService.save(user.id, user);
        if (oldPicture !== 'avatar.png')
        {
            try
            {
                fs.unlinkSync('./users_images/' + oldPicture);
            }
            catch
            {
            }
        }
        return user.avatarURI;
    }

    @Get('/picture/:avatarURI')
    async getPictureByUsername(@Param("avatarURI") avatarURI:string, @Res() res: Response)
    {
        const path = require('path');
        const relativePath = path.join(__dirname, '../../../users_images', avatarURI);
        try
        {
            fs.accessSync(relativePath);
        }
        catch
        {
            throw new BadRequestException("Picture not found");
        }
        res.sendFile(relativePath);
    }

    @UseGuards(JwtGuard)
    @Get('info/:username')
    async getInfoByUsername(@Param('username') username:string, @Request() req)
    {
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        return this.userService.getAllInfoFromUsername(username);
    }

    @Get("/allUsersButUserId/:userId")
    findAllUsersButUserId(@Param("userId") userId:number)
    {
        return this.userService.getAllUsersButUserId(userId);
    }

    @Get("/allUsersWithNoDirectMessageWithUserId/:userId")
    findAllUsersWithNoDirectMessageWithUserId(@Param("userId") userId:number)
    {
        return this.userService.getAllUsersWithNoDirectMessageWithUserId(userId);
    }

    @Get("/allUsersButUserIdandFriends/:userId")
    findAllUsersButUserIdAndFriends(@Param("userId") userId:number)
    {
        return this.userService.getAllUsersButUserIdAndFriends(userId);
    }
}
