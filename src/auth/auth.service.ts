import { BadRequestException, ForbiddenException, Get, Injectable, NotFoundException, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg'
import * as bcrypt from 'bcrypt';
import { PostgresService } from 'src/ecosystem-service/pg.service';
import { ResponseTokenDTO } from 'src/users/dto/response-token.dto';
import { ErrorMessageDTO } from 'src/data-models/error-message.dto';
import { ResponseUserDto } from 'src/users/dto/response-user.dto';
import { RedisService } from 'src/ecosystem-service/redis.service';
import { User } from 'src/data-models/users-models';
import {RedisClientType } from 'redis'
import { CreateUserDto } from 'src/users/dto/create-user.dto';



@Injectable()
export class AuthService {
  pool: Pool
  client : RedisClientType
  constructor(private readonly jwtService: JwtService, private readonly postgresService: PostgresService, private readonly redisService: RedisService) {
    this.pool = postgresService.pool;
    this.client = redisService.client;
  }



  async loginUser(loginUserDto): Promise<ResponseTokenDTO | ErrorMessageDTO> {
    
    try {
      const { email, password } = loginUserDto;
      const getUser = await User.getUserFromEmail(email, this.pool);
      if(!getUser){
        throw new NotFoundException('User not found');
      }
      const pass = await this.client.get(`user:${getUser.userId}`)
      const json = JSON.parse(pass);
      let pas;
      if(json){
        pas = json.password;
      }else{
        const {rows}= await this.pool.query('select * from users where userid =$1 and enable = 1', [getUser.userId]);
        pas = rows[0].data.password
      }

      const passwordMatch = await bcrypt.compare(password, pas);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.jwtService.sign({ userId: getUser.userId }, { secret: 'test' });
      console.log(token, getUser.userId )
      return {
        userId: getUser.userId,
        token
      };
    } catch (error) {
      console.log(error)
      return {
        status: error.status,
        message: error.message,
      }
    }
  }


  // const phash = await bcrypt.hash(body.password, 10);
  // const user = await User.build3({...body, password: phash})
  // const data = {
  //   name: user.name,
  //   email: user.email,
  //   password: user.password
  // }
  // const {rows} = await this.pool.query('insert into users (user_id, data, enabled) values ($1,$2,$3) returning *', [user.userId, data, user.enable])
  // console.log(rows[0])

  async createUser(createUserDto: CreateUserDto): Promise<ResponseUserDto | ErrorMessageDTO> {
    try {
     
      if (createUserDto.password !== createUserDto.confirm_password) {
        throw new BadRequestException('Passwords do not match');
      }

      const userAlready = await User.getUserFromEmail(createUserDto.email, this.pool)
      if(userAlready){
        throw new ForbiddenException('User already exists')
      }
    
      const phash= await bcrypt.hash(createUserDto.password, 10);
      const data = await User.build3({...createUserDto, password: phash})
      //console.log(data)
      await data.savedata2(this.pool, this.client);
      //console.log(data.userId)
      const userbyid = await User.getUserById2(data.userId, this.pool, this.client )
      console.log(userbyid)
      return {userId: userbyid.userId, name: userbyid.name, email: userbyid.email, roleId: userbyid.roleId }
  
     
    } catch (err) {
      return {
        status: err.status,
        message: err.message,
      }
    }

  }

}
