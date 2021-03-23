import * as fs from 'fs';
import logger from '../lib/logger';
import config from '../lib/config';

export default function init() {
  //create temp file upload directory
  logger.info(`loaders.directory:init::Checking if directory "${config.fileUpload.tempDirectory}" exists.`)
  createDirectoryIfNotExists(config.fileUpload.tempDirectory)
}


export function createDirectoryIfNotExists(path: string): void {
  try {
    // first check if directory already exists
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
      logger.info(`loaders.directory:createDirectoryIfNotExists::Directory "${path}" was created.`);
    } else {
      logger.info(`loaders.directory:createDirectoryIfNotExists::Directory "${path}" was not created, it already exists.`);
    }
  } catch (error) {
    logger.error(`loaders.directory:createDirectoryIfNotExists::Directory "${path}" could not be created.`, error);
    throw error
  }
}

