
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';
import redisConfig from 'src/config/redis.config';

@Injectable()
export class RedisService {
  client:  RedisClientType;

  constructor(
    @Inject(redisConfig.KEY) private readonly redisConf: ConfigType<typeof redisConfig>,
  ) {
    void this.connect();
  }
  async connect() {
    console.log(this.redisConf)
    this.client =  createClient(this.redisConf);
    await this.client.connect();

  }
}
