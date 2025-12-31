# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy Prisma schema before npm install (fix)
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build Next.js
RUN npm run build

# 2. Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
