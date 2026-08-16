# syntax=docker/dockerfile:1
FROM node:26-alpine AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm@11.21.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build
RUN pnpm prune --prod

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=/data/local.db

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/drizzle drizzle/
COPY --from=builder /app/scripts scripts/
COPY package.json .

RUN mkdir -p /data && chown node:node /data
VOLUME /data

USER node
EXPOSE 3000
CMD [ "sh", "-c", "node scripts/migrate.js && node build" ]
