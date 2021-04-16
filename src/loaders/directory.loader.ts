import * as fs from 'fs';
import logger from '../lib/logger';
import config from '../lib/config';

export default function init() {
  //create temp file upload directory
  logger.info(`loaders.directory:init::Checking if directory "${config.fileUpload.tempDirectory}" exists.`)
  createDirectoryIfNotExists(config.fileUpload.tempDirectory)
  createDirectoryIfNotExists(config.fileUpload.customerUploadDirectory)
}


export function createDirectoryIfNotExists(directoryPath: string): void {
  logger.info(`loaders.directory:createDirectoryIfNotExists::Directory "${directoryPath}"`);

  try {
    // first check if directory already exists
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, {recursive: true});
      logger.info(`loaders.directory:createDirectoryIfNotExists::Directory "${directoryPath}" was created.`);
    } else {
      logger.info(`loaders.directory:createDirectoryIfNotExists::Directory "${directoryPath}" was not created, it already exists.`);
    }
  } catch (error) {
    logger.error(`loaders.directory:createDirectoryIfNotExists::Directory "${directoryPath}" could not be created.`, error);
    throw error
  }
}

