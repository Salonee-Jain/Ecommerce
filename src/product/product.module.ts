import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PostgresService } from 'src/ecosystem-service/pg.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/ecosystem-service/redis.service';


@Module({
  controllers: [ProductController],
  providers: [PostgresService, JwtService, RedisService, ProductService]
})
export class ProductModule {}
