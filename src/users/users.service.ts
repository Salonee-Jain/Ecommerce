import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Pool } from 'pg'

import { PostgresService } from 'src/ecosystem-service/pg.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { ResponseUserDto } from './dto/response-user.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorMessageDTO } from 'src/data-models/error-message.dto';
import { User } from 'src/data-models/users-models'
import { RedisService } from 'src/ecosystem-service/redis.service';
import { RedisClientType } from 'redis'
import { CreateUserDto } from './dto/create-user.dto';


let num = 0;

@Injectable()
export class UsersService {
 


  client: RedisClientType
  pool: Pool
  constructor(private readonly poolService: PostgresService, private readonly jwtService: JwtService, redisService: RedisService
  ) {
    this.pool = poolService.pool;
    this.client = redisService.client;

  }


  async create(body: CreateUserDto) {
    const phash = await bcrypt.hash(body.password, 10);
    const user = await User.build3({...body, password: phash})
    const data = {
      name: user.name,
      email: user.email,
      password: user.password,
      roleId: user.roleId,
    }
    const {rows} = await this.pool.query('insert into users (user_id, data, enabled) values ($1,$2,$3) returning *', [user.userId, data, user.enabled])
    console.log(rows[0])
  }




  async convertDataToResponse(data: User): Promise<ResponseUserDto | ErrorMessageDTO> {
    // const responseData = {
    //   userId: data.userId,
    //   name: data.name,
    //   email: data.email,
    //   role: data.role,
    //   scopes: data.scopes,
    // }

    return;
  }


  async getUserbyID(userId: string): Promise<ResponseUserDto | ErrorMessageDTO> {


    const userById = await User.getUserById2(userId, this.pool, this.client)
    const result = await this.convertDataToResponse(userById);
    return result;
  }


  async getProfile(user): Promise<ResponseUserDto | ErrorMessageDTO> {
    try {
      //console.log(user)
      const profile = await User.getUserById2(user.userId, this.pool, this.client);
      const result = await this.convertDataToResponse(profile);
      return result;
    } catch (err) {
      return {
        status: err.status,
        message: err.message,
      }
    }
  }

  async getUsers(): Promise<ResponseUserDto[] | ErrorMessageDTO> {
    try {
      const users = await User.getUsers2(this.pool, this.client)
      let newarr = []
      for (let user of users) {
        const data = await this.convertDataToResponse(user)
        newarr.push(data)
      }
      return newarr;
    } catch (err) {
      return {
        status: err.status,
        message: err.message,
      }
    }

  }






  ////////////////////////////////////////////////////////////////





  // async getUser(userId: string): Promise<ResponseUserDto | ErrorMessageDTO> {
  //   try{
  //     const users = await User.getUserById(userId,this.pool, this.client);
  //   }catch(err){
  //     return {
  //       status: err.status,
  //       message: err.message,
  //     }
  //   }
  // }


  async updateUser(user, id: string, updateUserDto: UpdateUserDto): Promise<ResponseUserDto | ErrorMessageDTO> {
    try {

      if (user.userId != id) {
        throw new UnauthorizedException('User not logged in ')
      }

      const { email, password } = updateUserDto
      if (email) {
        const alreadyEmail = await User.getUserFromEmail(email, this.pool)
        if (alreadyEmail) {
          throw new ForbiddenException(alreadyEmail.email + " already exists")
        }
      }

      let phash;
      if (password) {
        phash = await bcrypt.hash(password, 10);
      }
      //console.log({ userId: id, ...updateUserDto,  password: phash })
      // const data = await User.build({ ...updateUserDto, userId: id, password: phash })
      // await data.savedata(this.pool, this.client)

      // const userbyid = await User.getUserById(id, this.pool, this.client) as ResponseUserDto;;
      // console.log(userbyid)
      // return {
      //   userId: userbyid.userId,
      //   email: userbyid.email,
      //   name: userbyid.name,
      //   roleId: "userbyid.roleId",
      //   scopes:" userbyid.roleId",
      // }
      return;


    } catch (err) {
      console.log(err)
      return {

        status: err.status,
        message: err.message,
      }
    }
  }


  //


  async deleteUser(user, id: string): Promise<ResponseUserDto | ErrorMessageDTO> {

    try {
      if (user.userId != id) {
        throw new UnauthorizedException('User not loggged in')
      }
      const userbyid = await User.getUserById2(id, this.pool, this.client)
      console.log(userbyid)
      if (userbyid) {
        await User.deleteUser2(userbyid.userId, this.pool, this.client)

      }
    } catch (err) {
      return {
        status: err.status,
        message: err.message,

      }
    }
  }

}
