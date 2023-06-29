import { Body, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Pool } from 'pg'
import { PostgresService } from 'src/ecosystem-service/pg.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ResponseProductDTO } from './dto/response-product.dto';
import { ErrorMessageDTO } from 'src/data-models/error-message.dto';
import { QueryProductDTO } from './dto/query-product.dto';
import { Product } from 'src/data-models/product-model';
import { RedisService } from 'src/ecosystem-service/redis.service';
import { RedisClientType } from 'redis';



@Injectable()
export class ProductService {

  pool: Pool;
  client: RedisClientType;

  constructor(private readonly poolService: PostgresService, private readonly jwtService: JwtService, private readonly redisServivce: RedisService) {
    this.pool = poolService.pool;
    this.client = redisServivce.client;
  }




  //------------------------------------Without query Parameters------------------------------------

  //offset = 0;
  // async getAllProducts(): Promise<[ResponseProductDTO] | ErrorMessageDTO> {
  //   try{
  //   const products = await this.pool.query('SELECT * FROM products WHERE enable = 1::BIT ORDER BY name desc OFFSET $1 LIMIT 2', [this.offset]);
  //   if(products.rows.length<=0){
  //     return {
  //       message: 'end of list'
  //     }
  //   }
  //   let productsData = products.rows.map(product => ({
  //     id: product.id,
  //     name: product.name,
  //     price: product.price,
  //     description: product.description,
  //     isOutOfStock: product.isoutofstock
  //   }))
  //   this.offset += 2;
  //   return productsData;
  // }catch(err){
  //   return {
  //     status: err.status,
  //     message: err.mesaage
  //   }
  // }



  private async convertToResponsne(product: Product): Promise<ResponseProductDTO | undefined> {
    if (!product) {
      return undefined
    }
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      isoutofstock: product.isoutofstock

    }
  }


  async getAllProducts(offsetLimit: QueryProductDTO): Promise<ResponseProductDTO[] | ErrorMessageDTO> {
    try {
      //const data = new Product();
      const products = await Product.getProducts(this.pool, this.client, offsetLimit);
      const result = []
      for (let product of products) {
        result.push(await this.convertToResponsne(product))
      }
      return result;
    } catch (err) {
      return {
        status: err.status,
        message: err.message
      }
    }
  }



  async getProduct(id: string): Promise<ResponseProductDTO | ErrorMessageDTO> {
    try {
      const productbyid = await Product.getProductsById(this.pool, this.client, id);
      const result = await this.convertToResponsne(productbyid);
      return result;
    } catch (err) {
      return {
        status: err.status,
        message: err.message
      }
    }
  }

  

  //----------------------------------------Post Product--------------------------------//

  async createProduct(user, createProductDto: CreateProductDto): Promise<ResponseProductDTO | ErrorMessageDTO> {
    console.log(user)
    if (!user.userId) {
      throw new UnauthorizedException('User not logged in')
    }

    try {
      const data = await Product.build(createProductDto);
      await data.saveData(this.pool, this.client);
      console.log('Product saved successfully')
      const result = this.convertToResponsne(data);
      return result;
    } catch (err) {
      console.log(err)
      return {
        status: err.status,
        message: err.message
      }
    }

  }

  async updateProduct(user, id: string, @Body() updatedProduct: UpdateProductDto): Promise<ResponseProductDTO | ErrorMessageDTO> {
    try{
      if(!user.userId){
        throw new UnauthorizedException('User not logged in')
      }
      const product = new Product();
      const data = await Product.build({id,...updatedProduct});
      //console.log(data)
      await product.saveData(this.pool, this.client);
      const byid =  await Product.getProductsById(this.pool, this.client, id);
      const result = await this.convertToResponsne(byid)
      console.log(result)
      return result;

    }catch(err){
      return {
        status: err.status,
        message: err.message,
      }
    }
  }

  async deleteProduct(user, id: string): Promise<ResponseProductDTO | ErrorMessageDTO> {
   try{
    if (!user) {
      throw new UnauthorizedException('User is not logged in')
    }
 
    const product =  new Product();
    await product.deleteProduct(id, this.pool, this.client)
   return {
    message: 'deleted product'
   }

    } catch (err) {
      console.log(err)
      return {
        status: err.status,
        message: err.message
      }
    }


  }


}

