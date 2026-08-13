# syntax=docker/dockerfile:1

FROM node:26-bookworm-slim AS build

ENV CI=true
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /app

RUN npm install --global pnpm@11.21.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY packages/js-sdk/package.json packages/js-sdk/package.json

RUN pnpm install --frozen-lockfile

COPY backend backend
COPY packages packages

RUN pnpm --filter @flagforge/backend build

FROM node:26-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3001
ENV TYPEORM_MIGRATIONS_RUN=true

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 3001

CMD ["node", "dist/main.js"]
