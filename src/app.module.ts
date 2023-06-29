import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import postgresConfig from './config/postgres.config';
import { PostgresService } from './ecosystem-service/pg.service';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { CartService } from './cart/cart.service';
// import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
//import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
// import { AuthController } from './auth/auth.controller';
import { AdminModule } from './admin/admin.module';
import redisConfig from './config/redis.config';
import { RedisService } from './ecosystem-service/redis.service';



//console.log(`${process.cwd()}/environment/.env.${process.env.NODE_ENV}`)
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:`${process.cwd()}/environment/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      load: [postgresConfig,redisConfig]
    }),
   UsersModule, ProductModule, CartModule, AdminModule],
  controllers: [AppController],
  providers: [JwtService,AuthService, PostgresService, AppService, RedisService],
})
export class AppModule {}
