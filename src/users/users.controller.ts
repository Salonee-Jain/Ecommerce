import { Controller, Get, Post, Body, Param, Put, UseGuards, Delete , Request, Req, ValidationPipe} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard'
import { CartService } from 'src/cart/cart.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { ApiBody, ApiHeader, ApiHeaders, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseUserDto } from './dto/response-user.dto';
import { ResponseTokenDTO } from './dto/response-token.dto';
import { ErrorMessageDTO } from 'src/data-models/error-message.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  productService: any;
 
  constructor(private readonly usersService: UsersService,
    private readonly cartService: CartService, private readonly authService: AuthService) {}

  @ApiOperation({description: 'Get all users in the system'})
  @ApiOkResponse({type: Array<ResponseUserDto>, description: 'All Customer Objects'})
  @Get()
  getUsers(@Req() req): Promise< ResponseUserDto[] | ErrorMessageDTO>{
    return this.usersService.getUsers();
  }

  @ApiOperation({description: 'Get User profile if user is logged in'})
  @ApiHeader({ name:'token',description: 'Access token', required: true })
  @ApiOkResponse({type: ResponseUserDto, description: 'Logged in user profile'})
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) :Promise<ResponseUserDto | ErrorMessageDTO>{
    return this.usersService.getProfile(req.user)
  }

  @ApiOperation({description: 'Create a new user'})
  @ApiBody({type: CreateUserDto, description: 'New User Object'})
  @ApiOkResponse({type: [ResponseUserDto], description: 'Created User Object'})
  @Post('signup')
  async createUser(@Body() body: CreateUserDto): Promise<ResponseUserDto | ErrorMessageDTO>{
    // console.log(body)
    // await this.usersService.create(body)

    // return;
    return this.authService.createUser(body)
  }
  
  @ApiOperation({description: 'Login the user'})
  @ApiBody({type: LoginUserDto, description: 'Existing User Object'})
  @ApiOkResponse({type: ResponseTokenDTO, description: 'Logged In User Token'})
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<ResponseTokenDTO | ErrorMessageDTO>{
    return this.authService.loginUser(loginUserDto);
  }

  @ApiOperation({description: 'Get a specific user by their ID'})
  @ApiParam({name: 'id', type: String, required: true, description: 'Id of the user' })
  @ApiOkResponse({type: ResponseUserDto, description: 'Customer Object'})
  @Get(':id')
  getUser(@Param('id') id:string): Promise<ResponseUserDto | ErrorMessageDTO>{


    return this.usersService.getUserbyID(id)
    // return this.usersService.getUser(id);
  }


  @ApiOperation({description: 'Get a specific user by their ID'})
  @ApiParam({name: 'id', type: String, required: true, description: 'Id of the user' })
  @ApiOkResponse({type: ResponseUserDto, description: 'Customer Object'})
  @ApiHeader({ name:'token',description: 'Access token', required: true })
  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteUser(@Req() req, @Param('id') id:string): Promise<ResponseUserDto | ErrorMessageDTO>{
    return this.usersService.deleteUser(req.user, id);
  }

  @ApiOperation({description: 'Edit user by their ID'})
  @ApiBody({type: UpdateUserDto, description:'Updating fields'})
  @ApiParam({name: 'id', type: String, required: true, description: 'Id of the user' })
  @ApiOkResponse({type: ResponseUserDto, description: 'Updated Customer Object'})
  @ApiHeader({ name:'token',description: 'Access token', required: true })
  @UseGuards(AuthGuard)
  @Put(':id')
  updateUser(@Req() req , @Param('id') id:string, @Body() updateUserDto: UpdateUserDto) :Promise<ResponseUserDto|ErrorMessageDTO>{
    console.log(req.user)
    return this.usersService.updateUser(req.user, id, updateUserDto,);
  }

}








