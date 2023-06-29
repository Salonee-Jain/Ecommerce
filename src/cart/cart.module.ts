import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PostgresService } from 'src/ecosystem-service/pg.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../ecosystem-service/redis.service';

@Module({
  controllers: [CartController],
  providers: [JwtService, RedisService, PostgresService, CartService]
})
export class CartModule {}
