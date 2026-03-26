# [Build Stage] Node.js 환경에서 React 앱을 빌드합니다.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# [Run Stage] Nginx 환경에서 빌드된 결과물만 가져와서 실행합니다. (용량 최적화)
FROM nginx:alpine
# 방금 만든 Nginx 설정 파일 복사
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# Build Stage에서 생성된 결과물(dist) 복사
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]