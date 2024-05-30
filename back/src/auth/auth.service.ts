import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';


export type UserDetails  = {
    login42: string;
    nickname: string;
    auth2F: boolean;
    avatarURI: string;
};

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        @InjectRepository(User) private userRepo: Repository<User>,
        private readonly mailerService: MailerService,
      ) {}
    
    
    
    async validateUser(details: UserDetails) {
        const data = {
            user: null,
            signIn: false
        };
        const user = await this.userRepo.findOneBy({login42: details.login42})
        if (user)
        {
            data.user = user;
            data.signIn = true;
            return data;
        }
        const date = new Date().getDay().toString() + new Date().getMilliseconds().toString() + Math.floor(100 + Math.random() * 999).toString();
        details.nickname = details.login42 + date;
        const newUser = await this.userRepo.create(details);
        await this.userRepo.save(newUser);
        data.user = newUser;
        return data;
    }

    generateJwt(payload) {
        return this.jwtService.sign(payload, { secret: process.env.SECRET});
      }

      private async setTransport() {
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
          'https://developers.google.com/oauthplayground',
        );
    
        oauth2Client.setCredentials({
          refresh_token: process.env.REFRESH_TOKEN2,
        });
    
        const accessToken: string = await new Promise((resolve, reject) => {
          oauth2Client.getAccessToken((err, token) => {
            if (err) {
              reject('Failed to create access token');
            }
            resolve(token);
          });
        });
    
        const config: Options = {
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.EMAIL,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            accessToken,
          },
        };
        this.mailerService.addTransporter('gmail', config);
      }

        async sendMail(code:number, email:string) {
            await this.setTransport();
            this.mailerService
            .sendMail({
                transporterName: 'gmail',
                to: email, // list of receivers
                from: process.env.EMAIL, // sender address
                subject: 'Verficiaction Code', // Subject line
                text: 'Your verification code is: '+code,
            })
            .then(() => {
            })
            .catch(() => {
            });
        }
}