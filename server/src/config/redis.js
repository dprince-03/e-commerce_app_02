import Redis from 'ioredis';

let redisClient;

export function getRedis() {
  if (!redisClient) {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = Number(process.env.REDIS_PORT || 6379);
    const password = process.env.REDIS_PASSWORD || undefined;
    redisClient = new Redis({ host, port, password, lazyConnect: true });
  }
  return redisClient;
}

export async function initializeRedis() {
  const client = getRedis();
  if (!client.status || client.status === 'end') {
    await client.connect();
  }
  return client;
}

