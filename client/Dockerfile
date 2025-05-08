FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV WDS_SOCKET_PORT=0
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Add node_modules/.bin to PATH
ENV PATH="/usr/src/app/node_modules/.bin:${PATH}"

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "start"]