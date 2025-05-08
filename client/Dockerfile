FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g react-scripts@5.0.1

# Copy all other source code
COPY . .

# Expose port for development server
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV WDS_SOCKET_PORT=0
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV PATH="/usr/src/app/node_modules/.bin:${PATH}"

# Start development server with hot reloading
CMD ["npm", "start"]