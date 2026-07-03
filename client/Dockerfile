# ---------- Build ----------
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY client/package.json client/

RUN npm install --workspace shared --workspace client --include-workspace-root

COPY shared/ shared/
COPY client/ client/

RUN npm run build --workspace shared \
 && npm run build --workspace client

# ---------- Runtime (nginx) ----------
FROM nginx:1.27-alpine AS runtime
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist/client/browser /usr/share/nginx/html
EXPOSE 80
