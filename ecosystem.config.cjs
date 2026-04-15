/**
 * PM2 — https://pm2.keymetrics.io/
 * Uso: pm2 start ecosystem.config.cjs
 * Build antes: npm run build
 */
module.exports = {
  apps: [
    {
      name: 'iputa-api',
      cwd: __dirname,
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
