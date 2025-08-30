# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install required dependencies including OpenSSL
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    python3 \
    make \
    g++ \
    gcc \
    libc6-compat \
    && ln -s /lib/libc.musl-* /lib/libc.musl

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --production=false

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
