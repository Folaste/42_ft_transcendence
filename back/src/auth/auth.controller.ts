import { BadRequestException, Body, Controller, Get, Inject, Post, Request, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { JwtGuard } from "./guards/JwtGuards";
import { UserService } from "src/user/user.service";
import { TwoFaCodeService } from "src/twoFaCode/twoFaCode.service";
import { CheckTwoFaCode } from "src/twoFaCode/dto/createTwoFaCodeDto";

@Controller('auth')
export class AuthController {
    constructor(@Inject('AUTH_SERVICE') private readonly authService: AuthService,
    private readonly userService:UserService,
    private readonly twoFaCodeService:TwoFaCodeService
    ) {}

    @Get('redirect42')
    @UseGuards(AuthGuard('School'))
    async handle42Redirect(@Request() req, @Res() res: Response) {
        const data = await this.authService.validateUser(req.user);
        let htmlWithEmbeddedJWT;

        const token = this.authService.generateJwt({login42: data.user.login42 })
        if (data.user.auth2F == true)
        {
            htmlWithEmbeddedJWT = `
            <html>
            <script>
                window.location.href = 'http://localhost:3000/?TOKEN=${token}&USER=${req.user.login42}&2FA=true';
            </script>
            </html>`
      ;
        }
        else
        {
            htmlWithEmbeddedJWT = `
            <html>
            <script>
                window.location.href = 'http://localhost:3000/?TOKEN=${token}&USER=${req.user.login42}&2FA=false&signIn=${data.signIn}';
            </script>
            </html>`
      ;
        } 
        res.send(htmlWithEmbeddedJWT);
    }

    @UseGuards(JwtGuard)
    @Post('sendTwoFaCode')
    async sendCode(@Request() req)
    {
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        const code = Math.floor(100000 + Math.random() * 900000);

        const checkExistingCode = await this.twoFaCodeService.getTwoFaCodeByUserId(user.id);
        if (checkExistingCode)
            await this.twoFaCodeService.update(user.id, {code: code});
        else
            await this.twoFaCodeService.create({code: code, user_id: user.id});
        await this.authService.sendMail(code, user.email);
    }

    @UseGuards(JwtGuard)
    @Post('verifyCode')
    async verifyCode(@Request() req, @Body() checkTwoFaCode:CheckTwoFaCode)
    {
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        if (user.auth2F == false)
            throw new BadRequestException("Two Factor Authentification is not enabled");

        const checkExistingCode = await this.twoFaCodeService.getTwoFaCodeByUserId(user.id);
        if (!checkExistingCode)
        {
            throw new BadRequestException("User does not have a code already generated");
        }
        if (checkTwoFaCode.code === checkExistingCode.code)
        {
            const currentDate = new Date();
            const difference = (Math.abs(currentDate.getTime()) - checkExistingCode.date.getTime())
            if (difference <= (5 * 60 * 1000))
                return true;
            else 
                throw new BadRequestException("Code is expired");
        }
        else
            throw new BadRequestException("Code sent is invalid");
    }

    @UseGuards(JwtGuard)
    @Get('/verify/status')
    async verifyStatusofUser(@Request() req)
    {
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        else
            return true;
    }
}