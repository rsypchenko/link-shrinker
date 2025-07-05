
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const crypto = require("crypto");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateShortCode(length = 6) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

app.use(express.json());

// POST /shorten - create a short URL
app.post("/shorten", async (req, res) => {
  const { url } = req.body;
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }
  const code = generateShortCode();
  try {
    await prisma.url.create({ data: { code, url } });
    res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${code}` });
  } catch (err) {
    console.error("Error saving to database:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /:code - redirect to original URL
app.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const result = await prisma.url.findUnique({ where: { code } });
    if (result) {
      return res.redirect(result.url);
    }
    res.status(404).send("URL not found");
  } catch (err) {
    console.error("Error fetching from database:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
