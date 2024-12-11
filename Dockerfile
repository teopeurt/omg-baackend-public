# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA
RUN echo '                                                           \
server {                                                            \
    listen 80;                                                      \
    location / {                                                    \
        root /usr/share/nginx/html;                                 \
        index index.html;                                           \
        try_files $uri $uri/ /index.html;                          \
    }                                                              \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]