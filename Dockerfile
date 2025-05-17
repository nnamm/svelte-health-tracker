# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and download dependencies
COPY package.json package-lock.json ./
RUN npm ci
# RUN npm ci && npm audit --audit-level=high

# Copy source code
COPY . .

# Set environment variables
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_ENDPOINT=/health/records

# Build the applicaion
RUN npm run build

# Runtime stage
FROM nginx:alpine

ENV NGINX_ENTRYPOINT_QUIET_LOGS=1
EXPOSE 8080

# Create a non-root user
RUN adduser -D -u 1000 appuser

# Configure nginx for SPAs and create a custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create custom nginx.conf with properly configured paths for non-root user
RUN echo 'worker_processes auto;' > /tmp/nginx.conf && \
    echo 'pid /tmp/nginx.pid;' >> /tmp/nginx.conf && \
    echo 'events { worker_connections 1024; }' >> /tmp/nginx.conf && \
    echo 'http {' >> /tmp/nginx.conf && \
    echo '    include       /etc/nginx/mime.types;' >> /tmp/nginx.conf && \
    echo '    default_type  application/octet-stream;' >> /tmp/nginx.conf && \
    echo '    log_format  main  '"'"'$remote_addr - $remote_user [$time_local] "$request" '"'"'' >> /tmp/nginx.conf && \
    echo '                      '"'"'$status $body_bytes_sent "$http_referer" '"'"'' >> /tmp/nginx.conf && \
    echo '                      '"'"'"$http_user_agent" "$http_x_forwarded_for"'"'"';' >> /tmp/nginx.conf && \
    echo '    access_log  /tmp/nginx/access.log  main;' >> /tmp/nginx.conf && \
    echo '    sendfile        on;' >> /tmp/nginx.conf && \
    echo '    keepalive_timeout  65;' >> /tmp/nginx.conf && \
    echo '    include /etc/nginx/conf.d/*.conf;' >> /tmp/nginx.conf && \
    echo '}' >> /tmp/nginx.conf && \
    mv /tmp/nginx.conf /etc/nginx/nginx.conf

# Create required directories with proper permissions
RUN mkdir -p /tmp/nginx /var/cache/nginx && \
    chmod -R 777 /tmp /var/cache/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d /var/cache/nginx

# Copy only the necessary files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html
RUN chown -R appuser:appuser /usr/share/nginx/html

# Switch to non-root user
USER appuser

# Run nginx with custom config
CMD ["nginx", "-g", "daemon off;"]
