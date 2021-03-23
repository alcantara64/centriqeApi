import express from 'express';
import loaders from './loaders';
import logger from './lib/logger';
import config from './lib/config';

async function startServer() {
  const app = express();
  await loaders(app);

  const port: number = config.server.port;

  const server = app.listen(port, () => {
    logger.info(`Server is listening on port ${port}...`);

    process.on("unhandledRejection", ex => {
      logger.error("index::undhandledRejection", ex);
    });

    process.on("unhandledException", ex => {
      logger.error("index::unhandledException", ex);
      throw ex;
    });

  });

  return server;
}

startServer();
