FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Environment
ENV NODE_ENV=production

# Expose backend port
EXPOSE 7000

# Start backend
CMD ["npm", "start"]
