module.exports = {
  apps: [
    {
      name: 'ecommerce-server',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

