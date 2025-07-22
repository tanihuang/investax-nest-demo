import fs from 'fs';
import dotenv from 'dotenv';

const envFile = `.env.${process.env.NODE_ENV || 'dev'}`;
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

module.exports = {
  apps: [
    {
      name: 'nest-demo',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'dev',
        NODE_MODULE: process.env.NODE_MODULE,
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
      },
      env_production: {
        NODE_ENV: 'prod',
        NODE_MODULE: process.env.NODE_MODULE,
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
      },
    },
  ],
};
