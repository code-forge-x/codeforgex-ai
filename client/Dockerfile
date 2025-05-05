FROM node:16-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other source code
COPY . .

# Expose port for development server
EXPOSE 3000

# Start development server with hot reloading
CMD ["npm", "start"]