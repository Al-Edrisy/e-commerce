# Stage 1: Build the React app
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy custom nginx config if desired, else default is fine
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 3000 (map from host, though Nginx defaults to 80 inside the container)
EXPOSE 3000

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
