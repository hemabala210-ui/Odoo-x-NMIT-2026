FROM node:20-alpine

WORKDIR /app

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
