FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# package.json 복사 (start 명령을 위해 필요)

# COPY --from=builder --chown=nextjs:nodejs /app ./

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Next.js 서버를 위한 환경 변수가 필요하다면 여기서 설정합니다.
# 예시: ENV NODE_ENV=production

# 2-2. 권한 설정 (Docker/AWS 환경에서 권한 오류 방지)
# Node.js 유저를 생성하고 권한을 위임합니다.



ENV NODE_ENV=production
EXPOSE 3000

USER nextjs
# CMD ["npm", "start"]

CMD ["node", "server.js"]