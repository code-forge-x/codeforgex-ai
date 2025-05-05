module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Add any custom middleware here if needed
      return middlewares;
    },
    // Add other devServer configurations if needed
    hot: true,
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
  },
}; 