const path = require('path');
const dotenv = require('dotenv');

const parsed =
  dotenv.config({ path: path.join(__dirname, '.env') }).parsed ?? {};

module.exports = {
  apps: [
    {
      name: 'iputa',
      cwd: __dirname,
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        ...parsed,
        NODE_ENV: 'development',
      },
      env_production: {
        ...parsed,
        NODE_ENV: 'production',
      },
    },
  ],
};
