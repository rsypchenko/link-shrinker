const fastify = require("fastify")({ logger: true });
const { saveUrlMetadata } = require("./services/mongoService");
const {
  generateShortCode,
  saveUrlMapping,
  getOriginalUrl,
} = require("./services/redisService");

// Shorten URL endpoint
fastify.post("/shorten", async (request, reply) => {
  const { url, userId } = request.body;
  if (!url.match(/^https?:\/\//)) {
    return reply.code(400).send({ error: "Invalid URL" });
  }
  const shortCode = await generateShortCode();
  await saveUrlMapping(shortCode, url); // Save to Redis
  await saveUrlMetadata(shortCode, url, userId); // Save to MongoDB
  
  return { shortUrl: `https://yourdomain.com/${shortCode}` };
});

// Redirect endpoint
fastify.get("/:shortCode", async (request, reply) => {
  const { shortCode } = request.params;
  const originalUrl = await getOriginalUrl(shortCode);
  if (!originalUrl) {
    return reply.code(404).send({ error: "Not found" });
  }
  reply.redirect(originalUrl, 301);
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) throw err;
  console.log("Server running on port 3000");
});
