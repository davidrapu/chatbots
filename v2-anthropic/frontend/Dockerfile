FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
ARG VITE_CHATBOT_API=http://localhost:8000
COPY . .
RUN npm run build

FROM nginx:1.30.6-alpine
COPY --from=build /app/dist /usr/share/nginx/html
