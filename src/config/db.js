const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('urlShortener');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectMongoDB;