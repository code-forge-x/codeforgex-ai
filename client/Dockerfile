FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Clean up any previous installs (in case of cache)
RUN rm -rf node_modules package-lock.json

# Install dependencies using npm ci for faster and more reliable builds
# Install dependencies
RUN npm install

# Copy all other source code
COPY . .

ENV NODE_ENV=development
ENV WDS_SOCKET_PORT=0
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV PATH="/usr/src/app/node_modules/.bin:${PATH}"

# Start development server with hot reloading
CMD ["npm", "start"]