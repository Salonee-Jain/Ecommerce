import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBody, ApiHeader, ApiHeaders, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateCartDto } from './dto/create-cart.dto';
import { ResponseCartDTO } from './dto/response-cart.dto';
import { ErrorMessageDTO } from 'src/data-models/error-message.dto';
import { UserDecorator } from '../auth/user.decorator';
import { User } from 'src/data-models/users-models';
import axios from 'axios';


@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({description: 'Get all the cart Items'})
  @ApiOkResponse({description:'Cart item Object', type: ResponseCartDTO})
  @Get()
    getAllCartItems(): Promise<ResponseCartDTO[] | ErrorMessageDTO>{
      return this.cartService.getAllCartItems();
    }





    @ApiOperation({ description: 'Add product to cart' })
    @ApiBody({ type: CreateCartDto, description: 'Add new cart Item' })
    @ApiHeader({ name: 'token', description: 'Access token', required: true })
    @UseGuards(AuthGuard)
    @Post()
    async addToCart(@Req() req, @Body() cartItemDto):Promise<ResponseCartDTO | ErrorMessageDTO>{
      if (!req.user) {
        throw new Error('User not logged in');
      }
    return this.cartService.addToCart(req.user, cartItemDto);
    }
    





  @Get(':id')
  getCartItems(@Param('id') id: string) {
    return this.cartService.getCartItems(id)
  }



  @ApiParam({name: 'id', description: 'Cart Id', required: true})
  @ApiHeader({name:'token', description: 'acces token', required: true})
  @UseGuards(AuthGuard)
  @Delete(':id')
    removeFromCart(@UserDecorator() user, @Param('id') id: string) {
      console.log(user)
      return this.cartService.removeFromCart(user ,id);
    }



}
