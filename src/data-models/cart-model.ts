import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'
import { RedisClientType } from 'redis'
import * as jf from 'joiful';
import { Pool } from 'pg'
import { QueryProductDTO } from 'src/product/dto/query-product.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';


export class Cart {



    @jf.string()
    id: string;

    @jf.string()
    userId: string;

    @jf.string()
    productId: string;


    @jf.number()
    quantity: number;

    @jf.number()
    enable: number = 1;




    public static build(rawData: any): Cart {
        try {
            const model = new Cart();
            if (rawData.id !== undefined) model.id = rawData.id;
            else if (rawData.user_id !== undefined) model.id = rawData.id;
            else model.id = uuidv4();
            [
                'userId', 'productId', 'quantity', 'enable'
            ].forEach(async (key) => {

                if (rawData[key] !== undefined && rawData[key] !== null) model[key] = rawData[key];
            });
            //console.log(model)
            return model;
        } catch (err) {
            throw new Error(err.message)
        }
    }


    static async getAllCartItems(pool: Pool, client: RedisClientType): Promise<Cart[] | undefined> {
        try {

            const carts = await client.keys('cart:*');

            if (carts.length > 0) {
                const newArr = []

                for (const cart of carts) {
                    const value = await client.get(cart);
                    const json = await JSON.parse(value);
                    console.log(json)
                    if (json.enable == 1) {
                        newArr.push(Cart.build(json));
                    }
                }

                return newArr
            }
            const { rows } = await pool.query(`select * from cart where enable = 1`)
            const arr = rows.map((r) => {
                return Cart.build(r)
            })
            return arr;
        } catch (err) {
            throw new Error(err.message);
        }
    }


    static async getCartById(pool: Pool, client: RedisClientType, id: string) {
        try {
            const cart = await client.get(`cart:${id}`);
           
            if (cart) {
                const result = await JSON.parse(cart);
                return result;
            }
            const { rows } = await pool.query(`select * from cart where id= $1 and enable = 1`, [id])
            console.log(rows)
            if (rows.length > 0) {
                return Cart.build(rows[0])
            } else {
                return undefined
            }
        } catch (err) {
            throw new Error(err.message)
        }

    }
    async saveData(data: Cart, pool: Pool, client: RedisClientType) {
        console.log(data);
        await this.saveInRedis(data, pool, client);
        await this.saveInDatabase(data, pool, client);
    }
    private async saveInDatabase(rawdata: any, pool: Pool, client: RedisClientType) {
        const { enable, id, userId, productId, quantity } = rawdata;

        const { rows } = await pool.query('select * from cart where id=$1 and enable = 1', [rawdata.id])
        console.log('--------------------------------')
        console.log(rawdata.id)
        if (rows.length > 0) {
            const updateQuery = 'UPDATE cart SET quantity = $1 WHERE id = $2';
            const updatedProduct = await pool.query(updateQuery, [rawdata.quantity, rawdata.id]);
        } else {
            console.log('inside insert')
            const product = await pool.query('insert into cart (enable, id, userid, productid, quantity) values ($1,$2,$3,$4, $5)', [enable, id, userId, productId, quantity])
        }
    }
    private async saveInRedis(rawdata: any, pool: Pool, client: RedisClientType) {
        const redisKey = 'cart:' + rawdata.id;
        const product = await client.get('cart:' + rawdata.id)
        const result = await JSON.parse(product);
        let redisValue = JSON.stringify(rawdata);
        if (product) {
            const { id, userId, productId, quantity } = rawdata;
            if (quantity) {
                result.quantity = quantity
            }
            redisValue = await JSON.stringify(result)
        }
        await client.setEx(redisKey, 3600, redisValue);
    }





    async deleteCartItem(id: string, pool: Pool, client: RedisClientType) {

        const cart = await client.get(`cart:${id}`);
        if (cart) {
            const json = await JSON.parse(cart);
            json.enable = 0
            const value = JSON.stringify(json);
            await client.set(`pcart:${id}`, value);
        }
      
        const { rows } = await pool.query('SELECT * FROM cart WHERE id=$1 and enable=1', [id]);
        //console.log('userD', rows);
        if (rows.length > 0) {
            await pool.query(`UPDATE cart
      SET enable = 0
      WHERE id = $1;
      `, [id])
        } else {
            //console.log('user deleted')
            throw new NotFoundException('Cart Item not found')
        }
      
      
      
      
      }



}



