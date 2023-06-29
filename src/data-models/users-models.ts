import { ResponseUserDto } from "src/users/dto/response-user.dto";
import { ErrorMessageDTO } from "./error-message.dto";
import { Pool } from 'pg'
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'
import { RedisClientType } from 'redis'
import * as jf from 'joiful';
//import { CreateUserDto } from "src/users/dto/create-user.dto";


@Injectable()
export class User {


  @jf.string()
  userId: string;

  @jf.string().email()
  email: string;

  @jf.string()
  name: string;

  @jf.string()
  password: string;


  @jf.number()
  roleId: number;

  @jf.number()
  enabled: number = 1;





  static async getUsers2(pool: Pool, client: RedisClientType): Promise<User[]> {
    const userR = await client.keys('user:*');
    let newArr = [];
    for (const user of userR) {
      const value = await client.get(user);
      const json = await JSON.parse(value);
      if (json.enable == 1) {
        newArr.push(json);
      }
    }
    if (newArr) {
      //console.log(newArr)
      return newArr;
    }

    const { rows } = await pool.query('SELECT * FROM users where enable = 1;');
    if (rows.length > 0) {
      const newArr = []
      for (let r of rows) {
        const json = r.data
        if (r.enable == 1) {
          newArr.push({ userId: r.userId, name: json.name, email: json.email, role: json.role, scopes: json.scopes, enable: r.enable })
        }
      }
      return newArr;

    }



  }

  static async build3(rawData: any) {
    const model = new User();
    if (rawData.userId) { model.userId = rawData.userId }
    else if (rawData.user_id) {
      model.userId = rawData.user_id
      const data = rawData.data;
      model.name = data.name;
      model.email = data.email;
      model.password = data.password;
      model.roleId = data.roleId;
      model.enabled = rawData.enabled;
      return model;
    }
    else {
      model.userId = uuidv4();
    }

    [
      'name', 'email', 'password', 'roleId'
    ].forEach((key) => {
      model[key] = rawData[key]
    })
    return model;

  }



  async savedata2(pool: Pool, client: RedisClientType): Promise<void> {
    console.log('inside savedata2')
    await this.saveInDataBase(pool, client);
    await this.saveInRedis2(pool, client)

  }
  async saveInRedis2(pool: Pool, client: RedisClientType) {
    const redisKey = `user:${this.userId}`;
    const redisValue = JSON.stringify(this);
    await client.setEx(redisKey, 36000, redisValue)
    const user = await client.get(redisKey)
  }

  async saveInDataBase(pool: Pool, client: RedisClientType): Promise<void> {
    let { userId, name, email, password, roleId, enabled } = this;
    let data = { name, email, password, roleId }
    const { rows } = await pool.query('insert into users (user_id, data, enabled) values ($1,$2,$3) returning *', [userId, data, enabled]);
  }



  public static async getUserFromEmail(email: string, pool: Pool): Promise<ResponseUserDto | undefined> {
    const query = `SELECT * FROM users WHERE data->>'email' = $1`;
    const values = [email];
    const { rows } = await pool.query(query, values);
    let user;
    if (rows.length > 0) {
      const userData = rows[0].data;
      user = {
        userId: rows[0].userid,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        roleId: userData.roleId,
        enabled: rows[0].enabled
      };
    }
    return user;
  }




  static async getUserById2(userId: string, pool: Pool, client: RedisClientType): Promise<User | undefined> {
    const user = await client.get(`user:${userId}`);
    console.log(user)
    let data;
    if (user) {
      data = await JSON.parse(user)
      if (data.enable == 1) {
        console.log(data)
        return this.build3(data)
      }
    }
    // const { rows } = await pool.query('select * from users where user_id=$1 and enabled= 1', [userId]);
  
    // if (rows.length > 0) {
    //   data = rows[0];
    //   return this.build3(data)
    // } else {
    //   throw new NotFoundException('User not found')
    // }
  }



  async savedata(pool: Pool, client: RedisClientType): Promise<void> {
    await this.saveInDatabase(pool, client);
    await this.saveInRedis(pool, client)

  }

  private async saveInDatabase(pool: Pool, client: RedisClientType): Promise<ResponseUserDto | ErrorMessageDTO> {
    const query = 'SELECT * FROM dummyusers WHERE user_id = $1';
    const { rows } = await pool.query(query, [this.userId]);

    if (rows.length > 0) {
      const { name, email, password } = this;
      const updateFields = [];
      const values = [this.userId];

      let index = 2;

      if (name != null) {
        updateFields.push(`name = $${index}`);
        values.push(name);
        index++;
      }

      if (email != null) {
        const alreadyEmail = await User.getUserFromEmail(email, pool);
        if (alreadyEmail) {
          throw new ForbiddenException('Email already exits use other email')
        }
        updateFields.push(`email = $${index}`);
        values.push(email);
        index++;
      }

      if (password != null) {
        updateFields.push(`password = $${index}`);
        const phash = await bcrypt.hash(password, 10)
        values.push(phash);
        index++;
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE dummyusers SET ${updateFields.join(', ')} WHERE user_id = $1 and enable=1 returning *`;
        const { rows } = await pool.query(updateQuery, values);
        return rows.map(r => ({
          userId: r.user_id,
          email: r.email,
          name: r.name,
        }))[0]
      }
    } else {
      const insertQuery = 'INSERT INTO dummyusers (user_id, name, email, password) VALUES ($1, $2, $3, $4) returning *';
      const value = await pool.query(insertQuery, [this.userId, this.name, this.email, this.password]);
      return value.rows.map((r) => ({ userId: r.userId, email: r.email, name: r.name }))[0]

    }
  }


  private async saveInRedis(data: User, client: any) {
    try {
      const redisKey = `user:${data.userId}`;
      let redisValue = JSON.stringify(data)
      const exists = await client.exists(redisKey);
      if (exists === 1) {
        const value = await client.get(redisKey);
        const json = await JSON.parse(value);
        if (data.email) {
          json.email = data.email
        }
        if (data.name) {
          json.name = data.name
        }
        if (data.password) {
          json.password = data.password
        }
        redisValue = JSON.stringify(json);
      }
      await client.setEx(redisKey, 36000, redisValue);

    } catch (err) {
      return false;
    }
  }


  static async deleteUser(userId, pool: Pool, client: RedisClientType) {
    const user = await client.get(`user:${userId}`);
    if (user) {
      const json = await JSON.parse(user);
      json.enable = 0
      const value = JSON.stringify(json);
      await client.set(`user:${userId}`, value);
    }

    const userD = await pool.query('SELECT * FROM dummyusers WHERE user_id=$1', [userId]);
    console.log('userD', userD);
    if (userD.rows.length > 0) {
      await pool.query(`UPDATE dummyusers 
      SET enable = 0
      WHERE user_id = $1;
      `, [userId])
    } else {
      throw new NotFoundException('User not found')
    }
  }


  static async deleteUser2(userId, pool: Pool, client: RedisClientType) {
    const user = await client.get(`user:${userId}`);
    if (user) {
      const json = await JSON.parse(user);
      json.enable = 0
      const value = JSON.stringify(json);
      await client.set(`user:${userId}`, value);
    }

    const userD = await pool.query('SELECT * FROM users WHERE userid=$1', [userId]);
    console.log('userD', userD);
    if (userD.rows.length > 0) {
      await pool.query(`UPDATE users 
      SET data->>'enable' = '0'
      WHERE userid = $1;
      `, [userId])
    } else {
      throw new NotFoundException('User not found')
    }


  }

}




