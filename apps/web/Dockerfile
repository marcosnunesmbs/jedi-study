FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=__VITE_API_URL__
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache dumb-init

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["dumb-init", "--", "/entrypoint.sh"]
