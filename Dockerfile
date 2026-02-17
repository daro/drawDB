# Etap 1: Budowanie aplikacji
FROM node:20-alpine AS build

WORKDIR /app

# Kopiowanie plików zależności
COPY package.json ./
RUN npm install

# Kopiowanie reszty kodu i budowanie wersji produkcyjnej
COPY . .
ENV NODE_OPTIONS=""
RUN npm run build

# Etap 2: Serwer Nginx do serwowania plików
FROM nginx:stable-alpine AS production

# Kopiowanie zbudowanych plików z poprzedniego etapu
COPY --from=build /app/dist /usr/share/nginx/html

# Konfiguracja Nginx dla obsługi Single Page Application (React Router)
RUN echo 'server { \
    listen 8081; \
    server_name _; \
    root /usr/share/nginx/html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
