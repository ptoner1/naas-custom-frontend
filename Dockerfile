# Stage 1: Build the Angular app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the built files to Nginx's default directory
# Note: Ensure the path matches your project name in dist/
COPY --from=build /app/dist/naas-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]