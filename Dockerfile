# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and download dependencies
COPY package.json package-lock.json ./

# Install dependencies with security audit
RUN npm ci && npm audit --audit-level=high

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

# Secutiry: Create a non-root user
RUN adduser -D -u 1000 appuser

# Environment configuration
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1
EXPOSE 8080

# Copy improved nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Configure nginx for non-root execution
RUN mkdir -p /tmp/nginx /var/cache/nginx /var/log/nginx && \
    chmod -R 777 /tmp /var/cache/nginx /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d /var/cache/nginx /var/log/nginx

# Create custom nginx.conf for non-root execution
RUN echo 'worker_processes auto;' > /etc/nginx/nginx.conf && \
    echo 'pid /tmp/nginx.pid;' >> /etc/nginx/nginx.conf && \
    echo 'error_log /var/log/nginx/error.log warn;' >> /etc/nginx/nginx.conf && \
    echo 'events { worker_connections 1024; }' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    include       /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    default_type  application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    log_format  main  '"'"'$remote_addr - $remote_user [$time_local] "$request" '"'"'' >> /etc/nginx/nginx.conf && \
    echo '                      '"'"'$status $body_bytes_sent "$http_referer" '"'"'' >> /etc/nginx/nginx.conf && \
    echo '                      '"'"'"$http_user_agent" "$http_x_forwarded_for"'"'"';' >> /etc/nginx/nginx.conf && \
    echo '    access_log  /var/log/nginx/access.log  main;' >> /etc/nginx/nginx.conf && \
    echo '    sendfile        on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout  65;' >> /etc/nginx/nginx.conf && \
    echo '    gzip  on;' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/conf.d/*.conf;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Copy only the necessary files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Set proper ownership for web content
RUN chown -R appuser:appuser /usr/share/nginx/html

# Add health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

# Switch to non-root user for security
USER appuser

# Run nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
