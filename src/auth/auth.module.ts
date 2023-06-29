// import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { UsersModule } from '../users/users.module';
// import { JwtModule } from '@nestjs/jwt';
// import { AuthController } from './auth.controller';
// import { PostgresService } from 'src/ecosystem-service/pg.service';



// @Module({
//   imports: [
//     UsersModule,
//     JwtModule.register({
//       global: true,
//       secret: 'test',
//       signOptions: { expiresIn: '10000s' },
//     }),
//   ],
//   providers: [AuthService, PostgresService],
//   controllers: [AuthController],
//   exports: [AuthService],
// })
// export class AuthModule {}