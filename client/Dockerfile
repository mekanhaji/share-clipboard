# Use the Node alpine official image
# https://hub.docker.com/_/node
FROM oven/bun:latest AS build

# Create and change to the app directory.
WORKDIR /app

# Copy package files to the container image
# Bun uses bun.lockb and package.json/package-lock.json; copying package*.json is safe
COPY package*.json ./

# Install dependencies using bun
RUN bun install --frozen

# Copy local code to the container image.
COPY . ./

# Build the app using bun
RUN bun run build

# Use the Caddy image
FROM caddy

# Create and change to the app directory.
WORKDIR /app

# Copy Caddyfile to the container image.
COPY Caddyfile ./

# Copy local code to the container image.
RUN caddy fmt Caddyfile --overwrite

# Copy files to the container image.
COPY --from=build /app/dist ./dist

# Use Caddy to run/serve the app
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]