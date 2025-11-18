import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('connect', () => {
  console.log('Successfully connected to Redis cache');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error', err);
});

// Immediately connect
(async () => {
  await redisClient.connect();
})();

export default redisClient;