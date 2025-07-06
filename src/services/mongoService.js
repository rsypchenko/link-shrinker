const connectMongoDB = require('../config/db');

async function saveUrlMetadata(shortCode, originalUrl, userId) {
  const db = await connectMongoDB();
  const urlsCollection = db.collection('urls');
  await urlsCollection.insertOne({
    shortCode,
    originalUrl,
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
}

module.exports = { saveUrlMetadata };