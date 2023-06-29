import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PostgresService } from 'src/ecosystem-service/pg.service';
import { CartService } from 'src/cart/cart.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { RedisService } from 'src/ecosystem-service/redis.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtService, RedisService, AuthService, CartService, PostgresService]
})
export class UsersModule {}
