FROM node:18-alpine AS base

# Define build arguments for flexibility
# Default to api, but can be overridden
ARG APP_SCOPE=@repo/api
ARG APP_PATH=apps/api

# Prune stage: isolates the target application
FROM base AS builder
ARG APP_SCOPE
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Install turbo globally
RUN npm install turbo --global
COPY . .
# Prune for the specific app scope
# Note: Since packageManager is pnpm, turbo should generate pnpm-lock.yaml
RUN turbo prune --scope=${APP_SCOPE} --docker

# Installer stage: installs dependencies
FROM base AS installer
ARG APP_SCOPE
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm via corepack (included in Node 18)
RUN corepack enable

# Copy the pruned lockfile and package.json files
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Explicitly copy pnpm-workspace.yaml if it exists in the prune output, 
# although turbo prune usually sets up the json directory correctly
# COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the source code
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build the project
RUN pnpm run build --filter=${APP_SCOPE}...

# Runner stage: production ready image
FROM base AS runner
ARG APP_PATH
WORKDIR /app

# Ensure we have a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy the built application and dependencies
COPY --from=installer /app .

# Switch to non-root user
USER expressjs

# Expose the API port (this is documentation only, actual port is determined by app)
EXPOSE 5001

# Set the APP_PATH as an environment variable for the CMD
ENV SERVICE_PATH=$APP_PATH

# Start the application using the path variable
CMD node ${SERVICE_PATH}/dist/index.js
