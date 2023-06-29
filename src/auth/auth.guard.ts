import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor( private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //console.log(request.headers.token)
    const token = this.extractTokenFromHeader(request);
    //console.log(token);
    if (!token) {
      throw new UnauthorizedException('User not logged in');
    }
    //console.log(token)
    try {
      //console.log('insisde rty');
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: 'test'
        }
      );
    

      //console.log(payload);
      request['user'] = payload;
    } catch(err) {
      console.log(err)
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, tokenT] = (request.headers['token'] as string).split(' ');
    //console.log(tokenT);
    
    return type == 'Bearer' ? tokenT : undefined;
  }
}