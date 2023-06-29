import { registerAs } from "@nestjs/config";

export default registerAs('redisConfig', () => ({
    url: 'redis://' + ((process.env.REDIS_USERNAME || process.env.REDIS_PASSWORD) ? 
        `${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@` : '') +
        `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`

}));
