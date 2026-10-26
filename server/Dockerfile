FROM oven/bun:1.4.3

WORKDIR /app

COPY package.json bun.lock ./
COPY shared ./shared
COPY server ./server
COPY web/package.json ./web/package.json

RUN bun install --frozen-lockfile --production

ENV PORT=10000 \
    DB_PATH=/data/beatlab.db \
    TRUST_PROXY=1

RUN mkdir -p /data && chown -R bun:bun /app /data

VOLUME ["/data"]
EXPOSE 10000
USER bun

CMD ["bun", "server/src/index.ts"]
