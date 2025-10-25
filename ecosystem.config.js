module.exports = {
  apps: [{
    name: 'pos-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 8080',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_BASE: 'https://app-002-gen10-step3-1-py-oshima57.azurewebsites.net'
    }
  }]
};

