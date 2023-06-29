import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { Pool } from 'pg'
import { PostgresService } from 'src/ecosystem-service/pg.service';
import { ResponseCartDTO } from './dto/response-cart.dto';
import { ErrorMessageDTO } from 'src/data-models/error-message.dto';
import { RedisClientType } from 'redis';
import { RedisService } from 'src/ecosystem-service/redis.service';
import { Cart } from 'src/data-models/cart-model';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class CartService {
  pool: Pool
  client: RedisClientType;;
  constructor(private readonly poolService: PostgresService, private readonly redisService: RedisService) {
    this.pool = poolService.pool
    this.client = redisService.client;
  }


  private async convertToResponsne(cart: Cart): Promise<ResponseCartDTO | undefined> {
    if (!cart) {
      return undefined
    }
    return {
      id: cart.id,
      userId: cart.userId,
      productId: cart.productId,
      quantity: cart.quantity,
    }
  }


  async addToCart(user, cartItemDto: CreateCartDto): Promise<ResponseCartDTO | ErrorMessageDTO> {

    try {
      // const cart = await Cart.build()
      const response = await axios.post(`https://jsonblob.com/api/jsonBlob`, { userId: user.userId, ...cartItemDto });
      const key = `cart:${response.headers.location.substring(33)}`
      const value = await JSON.stringify(response.data)
      console.log(key, value)
      await this.client.setEx(key, 3600, value)
      return this.convertToResponsne(response.data)

    } catch (err) {
      console.log(err)
      return {
        status: err.status,
        message: err.message
      }
    }
  }



  async getCartItems(id: string): Promise<ResponseCartDTO | ErrorMessageDTO> {
    try {
      const data = await Cart.getCartById(this.pool, this.client, id);
      if (data) {
        const result = await this.convertToResponsne(data);
        return result;
      }
      const response = await axios.get(`https://jsonblob.com/api/jsonBlob/${id}`);
      const result = await this.convertToResponsne(response.data);
      return result

    } catch (err) {
      return {
        status: err.status,
        message: err.message,
      }

    }
  }

  async removeFromCart(user, cartId: string) {
    try {
      // const cart = new Cart();
      // //console.log(user)
      // const data = await Cart.getCartById(this.pool, this.client, cartId);
      // //console.log(data)
      // if (!data) {
      //   throw new NotFoundException('Cart item not found')
      // }
      // if (data.userId != user.userId) {
      //   throw new UnauthorizedException('User is not authorized')
      // }
      // await cart.deleteCartItem(cartId, this.pool, this.client)
      // return {
      //   message: 'Item removed from the Cart'
      // }

      const response = await axios.delete(`https://jsonblob.com/api/jsonBlob/${cartId}`)
      if(response.status === 200) {
        return {
          message: "Item removed successfully"
        }

      }
    } catch (err) {
      return {
        status: err.status,
        message: err.message
      }
    }
  }

  async getAllCartItems(): Promise<ResponseCartDTO[] | ErrorMessageDTO> {
    try {
      const result: ResponseCartDTO[] = [];
      const data = await this.client.keys("cart:*");

      for (const d of data) {
        const cart = await this.client.get(d)
        const r = JSON.parse(cart)
        result.push(r)
      }

      return result;
    } catch (err) {

      return {
        status: err.status,
        message: err.message,
      };
    }
  }

}