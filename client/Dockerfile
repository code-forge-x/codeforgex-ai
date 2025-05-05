FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies using npm ci for faster and more reliable builds

# Copy all other source code
COPY . .

# Expose port for development server
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV WDS_SOCKET_PORT=0
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Start development server with hot reloading
CMD ["npm", "start"]