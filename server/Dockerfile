FROM node:16-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies including development dependencies
RUN npm install

# Copy all other source code
COPY . .

# Expose port
EXPOSE 5000

# Start nodemon for hot reloading
CMD ["npm", "run", "dev"]