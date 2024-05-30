import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";


@Injectable()
export class SchoolStrategy extends PassportStrategy(Strategy,'School'){
    constructor(
       private http: HttpService
    ) {
        super({
            authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            clientID: process.env.CLIENT_ID_42,
            clientSecret: process.env.CLIENT_SECRET_42,
            callbackURL: 'http://localhost:3001/auth/redirect42',
            scope: ['public'],
        });
    }

    async validate(code: string): Promise<any> {
        const { data } = await firstValueFrom(this.http
        .get('https://api.intra.42.fr/v2/me', {
          headers: { Authorization: `Bearer ${code}` },
        }))
        const userData = {login42: data.login, email: data.email, nickname: data.login}
        return userData;
      }
}
