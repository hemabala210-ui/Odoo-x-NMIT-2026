FROM node:20-slim

WORKDIR /app

# Prisma needs OpenSSL
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy the entire monorepo
COPY . .

# Install all dependencies across workspaces
RUN npm install

# Generate the Prisma client
RUN npm run db:generate --workspace=database

# Expose Next.js and Backend ports
EXPOSE 3000
EXPOSE 4000

# The default command (can be overridden by docker-compose)
CMD ["npm", "run", "dev:frontend"]
