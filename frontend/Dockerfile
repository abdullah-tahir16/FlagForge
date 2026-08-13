# syntax=docker/dockerfile:1

FROM node:26-bookworm-slim AS build

ARG VITE_API_BASE_URL=http://localhost:3001/api/v1
ARG VITE_SHOW_DEMO_CREDENTIALS=true
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SHOW_DEMO_CREDENTIALS=${VITE_SHOW_DEMO_CREDENTIALS}

WORKDIR /app

RUN npm install --global pnpm@11.21.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY packages/js-sdk/package.json packages/js-sdk/package.json

RUN pnpm install --frozen-lockfile

COPY frontend frontend

RUN pnpm --filter @flagforge/frontend build

FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
