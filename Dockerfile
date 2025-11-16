FROM node:lts as build

# Install Deno
RUN apt-get update && \
    apt-get install -y curl unzip && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    ln -s /root/.deno/bin/deno /usr/local/bin/deno

WORKDIR /app
RUN deno --version
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Build with staging environment variables
# These are baked into the Astro build at BUILD TIME
ARG NODE_ENV=staging
ARG PUBLIC_ENVIRONMENT=staging
ARG PUBLIC_MODE=staging
ENV NODE_ENV=${NODE_ENV}
ENV PUBLIC_ENVIRONMENT=${PUBLIC_ENVIRONMENT}
ENV PUBLIC_MODE=${PUBLIC_MODE}

# Use build:staging script which respects NODE_ENV=staging
RUN npm run build:staging

# Stage 2
FROM node:lts as prod

# Install Deno
RUN apt-get update && \
    apt-get install -y curl unzip && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    ln -s /root/.deno/bin/deno /usr/local/bin/deno

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "./dist/server/entry.mjs"]