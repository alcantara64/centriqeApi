import * as express from 'express';
import logger from '../lib/logger';
import expressLoader from './express.loader';
import mongooseLoader from './mongoose.loader';
import prototypesLoader from './prototypes.loader';
import directoryLoader from './directory.loader';

export default async (app: express.Application): Promise<void> => {

  prototypesLoader();
  directoryLoader();

  const db = await mongooseLoader();
  if (db) {
    logger.info('loaders.index::MongoDB initialized.');
  } else {
    logger.error('loaders.index::MongoDB NOT initialized.');
    throw new Error("MongoDB NOT initialized");
  }

  await expressLoader(app);
  logger.info('loaders.index::Express initialized');
}
