import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'
import { RedisClientType } from 'redis'
import * as jf from 'joiful';
import { Pool } from 'pg'
import { QueryProductDTO } from 'src/product/dto/query-product.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';


export class Product {


    @jf.string()
    id: string;

    @jf.string()
    name: string;

    @jf.number()

    @jf.number()
    price: number;

    @jf.string()
    description: string;

    @jf.string()
    sku: string;

    @jf.boolean()
    isoutofstock: boolean;


    @jf.number()
    enable: number = 1;




    static build(rawData: any): Product {
        try {
            const model = new Product();
            if (rawData.id !== undefined) model.id = rawData.id;
            else if (rawData.user_id !== undefined) model.id = rawData.id;
            else model.id = uuidv4();
            [
                'name', 'price', 'description', 'sku', 'isoutofstock', 'enable'
            ].forEach(async (key) => {

                if (rawData[key] !== undefined && rawData[key] !== null) model[key] = rawData[key];
            });
            return model;
        } catch (err) {
            throw new Error(err.message)
        }
    }


    static async getProducts(pool: Pool, client: RedisClientType, offsetLimit: QueryProductDTO): Promise<Product[] | undefined> {
        try {
            let { offset, limit } = offsetLimit
            if (!offset || !limit) {
                throw new ForbiddenException('add offset limit')
            }
            const products = await client.keys('product:*');
         
           if(products.length>0){
            const newArr = []

            for (const product of products) {
                const value = await client.get(product);
                const json = await JSON.parse(value);
                console.log(json)
                if (json.enable == 1) {
                    newArr.push(this.build(json));
                }
            }

            if (newArr) {
                return newArr.splice(offset, offset+limit);
            }
           }
            const { rows } = await pool.query(`select * from products where enable = 1 order by name offset ${offset} limit ${limit}`)
            const arr = rows.map((r) => {
                return this.build(r)
            })
            return arr;
        } catch (err) {
            throw new Error(err.message);
        }
    }
        

    static async getProductsById(pool: Pool, client: RedisClientType, id: string) {
            try {
                const product = await client.get(`product:${id}`);
                if (product) {
                    const result = await JSON.parse(product);
                    return result;
                }
                const { rows } = await pool.query(`select * from products where id= $1 and enable = 1`, [id])
                if (rows.length > 0) {
                    return this.build(rows[0])
                } else {
                    return undefined
                }
            } catch (err) {
                throw new Error(err.message)
            }

        }

    public async saveData(pool: Pool, client: RedisClientType) {
        await this.saveInRedis(pool, client);
            await this.saveInDatabase(pool, client);

        }

    private async saveInRedis(pool: Pool, client: RedisClientType) {
        const redisKey = 'product:' + this.id;
        await client.setEx(redisKey, 3600, JSON.stringify(this));

    }

    private async saveInDatabase(pool: Pool, client: RedisClientType) {
        const { enable, id, name, price, description, sku, isoutofstock } = this;
        const { rows } = await pool.query('select * from products where id=$1', [this.id])
        console.log('--------------------------------')
        if (rows.length > 0) {
            const updateValues: any[] = [];
            const updateFields: string[] = [];

            if (name !== undefined) {
                updateFields.push('name');
                updateValues.push(name);
            }

            if (price !== undefined) {
                updateFields.push('price');
                updateValues.push(price);
            }

            if (description !== undefined) {
                updateFields.push('description');
                updateValues.push(description);
            }

            if (sku !== undefined) {
                updateFields.push('sku');
                updateValues.push(sku);
            }

            if (isoutofstock !== undefined) {
                updateFields.push('isoutofstock');
                updateValues.push(isoutofstock);
            }

            if (updateFields.length > 0) {
                const updateQuery = `UPDATE products SET ${updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ')} WHERE id = '${this.id}'`;
                //console.log(updateQuery,[...updateValues]);
                const updatedProduct = await pool.query(updateQuery, [...updateValues]);
            }
        } else {
            console.log('inside insert')
            const product = await pool.query('insert into products (enable, id, name, price, description, sku, isoutofstock) values ($1,$2,$3,$4,$5,$6, $7)', [enable, id, name, price, description, sku, isoutofstock])
        }
    }



    public async deleteProduct(id: string, pool: Pool, client: RedisClientType) {

        const product = await client.get(`product:${id}`);
        if (product) {
            const json = await JSON.parse(product);
            json.enable = 0
            const value = JSON.stringify(json);
            await client.set(`product:${id}`, value);
        }

        const { rows } = await pool.query('SELECT * FROM products WHERE id=$1 and enable=1', [id]);
        //console.log('userD', rows);
        if (rows.length > 0) {
            await pool.query(`UPDATE products
      SET enable = 0
      WHERE id = $1;
      `, [id])
        } else {
            //console.log('user deleted')
            throw new NotFoundException('Product not found')
        }




    }
}



