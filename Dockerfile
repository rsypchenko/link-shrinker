# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY src ./src

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "src/app.js"]