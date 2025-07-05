# Link Shrinker

This is a URL shortener Node.js service.

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up the database with Prisma:
   ```sh
   npx prisma migrate dev --name init
   ```
   To open Prisma Studio (GUI for DB):
   ```sh
   npx prisma studio
   ```
3. Start the server:
   ```sh
   node index.js
   ```
4. Open your browser and go to [http://localhost:3000](http://localhost:3000)

## Requirements
- Node.js
- npm
- SQLite (default, via Prisma)

## License
MIT
