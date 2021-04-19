import dotenv from 'dotenv';


// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// config() will read the .env file, parse the contents, assign it to process.env.
const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process
  console.log("loaders.config::No .env file loaded. Using environment variables only.");
} else {
  console.log("loaders.config::Using .env file.");
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("⚠  JWT Secret not set in .env file  ⚠");
}

const getMongoDbUrl = function (includePassword: boolean) {
  //for example mongodb://admin:12ayden@158.101.105.96:27017/admin?authSource=admin

  let credentials = ''
  if (process.env.MONGODB_USER) {
    let password = includePassword ? process.env.MONGODB_PW : '********';
    credentials = `${process.env.MONGODB_USER}:${password}@`
  }


  let mongoDbUrl = `mongodb://${credentials}${process.env.MONGODB_SERVERS}/${process.env.MONGODB_DATABASE}`
  if (process.env.MONGODB_OPTIONS) {
    mongoDbUrl += `?${process.env.MONGODB_OPTIONS}`
  }

  return mongoDbUrl;
}

const MONGO_DB_URL = getMongoDbUrl(true)
const MONGO_DB_URL_NOPW = getMongoDbUrl(false);



export default {
  nodeEnv: process.env.NODE_ENV,
  server: {
    port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 5000,
  },
  jwtSecret: jwtSecret,
  logging: {
    level: process.env.LOGGING_LOG_LEVEL || 'silly',
  },
  mongoDb: {
    url: MONGO_DB_URL,
    urlNoPw: MONGO_DB_URL_NOPW
  },
  messaging: {
    email: {
      defaultSender: process.env.EMAIL_DEFAULT_SENDER ? process.env.EMAIL_DEFAULT_SENDER : "",
    },
    whatsApp: {
      defaultSender: process.env.WHATSAPP_DEFAULT_SENDER ? process.env.WHATSAPP_DEFAULT_SENDER : "",
    },
    sms: {
      defaultSender: process.env.SMS_DEFAULT_SENDER ? process.env.SMS_DEFAULT_SENDER : "",
    },
  },
  email: {
    enabled: "true" === process.env.EMAIL_ENABLED,
    defaultSender: process.env.EMAIL_DEFAULT_SENDER ? process.env.EMAIL_DEFAULT_SENDER : "",
    mailgun: {
      apiKey: process.env.EMAIL_MAILGUN_API_KEY ? process.env.EMAIL_MAILGUN_API_KEY : "",
      testMode: "false" !== process.env.EMAIL_MAILGUN_TEST_MODE
    }
  },
  oracleCloud: {
    objectStorageURL: process.env.ORACLE_OBJECT_STORAGE_URL || '',
    bucketName: process.env.ORACLE_OBJECT_STORAGE_BUCKET_NAME || '',
    bucketFolder: process.env.ORACLE_OBJECT_STORAGE_BUCKET_FOLDER || '',
    privateBucketName: process.env.ORACLE_OBJECT_STORAGE_PRIVATE_BUCKET_NAME || ''
  },
  fileUpload: {
    tempDirectory: "temp",
    customerUploadDirectory: 'uploads/customers/upload',
    allowedFileTypesForCustomerDataUpload: process.env.ALLOWED_CUSTOMER_DATA_UPLOAD_FILE_TYPES ? process.env.ALLOWED_CUSTOMER_DATA_UPLOAD_FILE_TYPES.split(','): [ ] || [],
  }
}


