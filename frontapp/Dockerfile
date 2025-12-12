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
RUN chown -R nextjs:nodejs /app

# package.json 복사 (start 명령을 위해 필요)
COPY package.json ./
COPY --from=builder /app ./
# Builder의 node_modules에서 프로덕션 의존성 복사
COPY --from=builder /app/node_modules ./node_modules/
# .next 폴더(빌드 결과물) 복사
COPY --from=builder /app/.next ./.next
# public 폴더 복사
COPY --from=builder /app/public ./public


# Next.js 서버를 위한 환경 변수가 필요하다면 여기서 설정합니다.
# 예시: ENV NODE_ENV=production

# 2-2. 권한 설정 (Docker/AWS 환경에서 권한 오류 방지)
# Node.js 유저를 생성하고 권한을 위임합니다.

USER nextjs


EXPOSE 3000
CMD ["npm", "start"]