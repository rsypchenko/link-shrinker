const Redis = require('ioredis');
const base62 = require('base62/lib/ascii');

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Handle Redis connection errors
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Generate unique short code with minimum length
async function generateShortCode(minLength = 6) {
  try {
    let shortCode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const id = await redis.incr('url_counter');
      console.log(`ID: ${id}`);
      console.log(`Base62 encoded ID: ${base62.encode(id)}`);

      shortCode = base62.encode(id);
      // Pad with random base62 characters if too short
      while (shortCode.length < minLength) {
        shortCode = base62.encode(Math.floor(Math.random() * 62)) + shortCode;
      }
      attempts++;
    } while (await shortCodeExists(shortCode) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique short code after maximum attempts');
    }

    return shortCode;
  } catch (err) {
    throw new Error(`Failed to generate short code: ${err.message}`);
  }
}

// Store URL mapping in Redis with optional TTL (in seconds)
async function saveUrlMapping(shortCode, originalUrl, ttl = 30 * 24 * 60 * 60) {
  try {
    const key = `url:${shortCode}`;
    await redis.set(key, originalUrl, 'EX', ttl);
    return true;
  } catch (err) {
    throw new Error(`Failed to save URL mapping: ${err.message}`);
  }
}

// Retrieve original URL by short code
async function getOriginalUrl(shortCode) {
  try {
    const key = `url:${shortCode}`;
    const originalUrl = await redis.get(key);
    return originalUrl;
  } catch (err) {
    throw new Error(`Failed to retrieve URL: ${err.message}`);
  }
}

// Delete URL mapping
async function deleteUrlMapping(shortCode) {
  try {
    const key = `url:${shortCode}`;
    await redis.del(key);
    return true;
  } catch (err) {
    throw new Error(`Failed to{mgmt.delete URL mapping: ${err.message}`);
  }
}

// Check if short code exists
async function shortCodeExists(shortCode) {
  try {
    const key = `url:${shortCode}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (err) {
    throw new Error(`Failed to check short code existence: ${err.message}`);
  }
}

module.exports = {
  generateShortCode,
  saveUrlMapping,
  getOriginalUrl,
  deleteUrlMapping,
  shortCodeExists,
};