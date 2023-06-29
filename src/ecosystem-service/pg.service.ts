import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Pool } from 'pg';
import postgresConfig from "src/config/postgres.config";

@Injectable()
export class PostgresService {
    pool: Pool;
    constructor(
        @Inject(postgresConfig.KEY) private readonly pgConfig: ConfigType<typeof postgresConfig>
    ) {
        void this.connect();
    }

    async connect() {
        console.log(process.env.POSTGRES_USER);
        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DATABASE,
            password: process.env.POSTGRES_PASSWORD,
            port: process.env.POSTGRES_PORT
        })
    }
}