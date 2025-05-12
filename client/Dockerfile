FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g react-scripts@5.0.1
RUN npm install react-icons --save

# Copy all other source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV WDS_SOCKET_PORT=0
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Make sure node_modules/.bin is in PATH
ENV PATH="/usr/src/app/node_modules/.bin:${PATH}"

# Verify react-scripts is installed and executable
RUN which react-scripts
RUN ls -la $(which react-scripts)

# Expose port 3000
EXPOSE 3000

# Start development server using full path
CMD ["/usr/local/bin/react-scripts", "start"]