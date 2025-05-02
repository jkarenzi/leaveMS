import { DataSource } from "typeorm";
import dotenv from 'dotenv'
import Notification from "./entities/Notification";
import LeaveType from "entities/LeaveType";
import LeaveApplication from "entities/LeaveApplication";
import LeaveBalance from "entities/LeaveBalance";
dotenv.config()

const nodeEnv = process.env.NODE_ENV

const env = {
    PROD:{
        host: process.env.DB_HOST as string,
        database: process.env.DB_NAME as string,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT as string) : 5432,
        username: process.env.DB_USER as string,
        password: process.env.DB_PASS as string
    },
    DEV:{
        host: process.env.DB_HOST as string,
        database: process.env.DB_NAME as string,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT as string) : 5432,
        username: process.env.DB_USER as string,
        password: process.env.DB_PASS as string
    },
    TEST:{
        host: process.env.TEST_DB_HOST as string,
        database: process.env.TEST_DB_NAME as string,
        port: process.env.TEST_DB_PORT ? parseInt(process.env.TEST_DB_PORT as string) : 5432,
        username: process.env.TEST_DB_USER as string,
        password: process.env.TEST_DB_PASS as string
    }
}

const dbConfig = env[nodeEnv] || env.TEST;
console.log("Database configuration:", dbConfig);


export const AppDataSource = new DataSource({
    type: "postgres",
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: true,
    logging: false,
    entities: [Notification, LeaveType, LeaveApplication, LeaveBalance],
    subscribers: [],
    migrations: [],
})