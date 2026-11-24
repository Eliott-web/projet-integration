import 'dotenv/config';
import { Sequelize } from 'sequelize';

class Database {
    private static instance: Sequelize;

    private constructor() {}

    public static getInstance(): Sequelize {
        if (!Database.instance) {
            Database.instance = new Sequelize(
                process.env.DB_NAME!,
                process.env.DB_USER!,
                process.env.DB_PASSWORD!,
                {
                    host: process.env.DB_HOST,
                    port: Number(process.env.DB_PORT),
                    dialect: 'postgres',
                    logging: false,
                    dialectOptions: {
                        ssl: {
                            require: true,
                            rejectUnauthorized: false
                        }
                    }
                }
            );
        }

        return Database.instance;
    }
}

const sequelize = Database.getInstance();
import dotenv from 'dotenv';
const result = dotenv.config();
console.log('dotenv erreur =', result.error?.message ?? 'aucune');
console.log('clés lues =', Object.keys(result.parsed ?? {}));
export default sequelize;