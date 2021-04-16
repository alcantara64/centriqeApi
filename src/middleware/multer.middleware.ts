import multer from 'multer'
import path from 'path';
import config from '../lib/config'


import GridFsStorage from 'multer-gridfs-storage';


export const gridCostumerStorage = new GridFsStorage({ url: config.mongoDb.url,
  file:(req:any, file:any) =>{
       let fileName = '';
    const ext = path.extname(file.originalname);
    if (req.body.name) {
      fileName = req.body.name + ext;
    } else {
      fileName = file.originalname;
    }
    req.body.fileName = fileName;
    return {
      bucketName:'fileuploads',
      filename: fileName,
    }

} });

const fileFilter = (req:any, file:any, cb:CallableFunction) =>{
 const allowedExtentions = config.fileUpload.allowedFileTypesForCustomerDataUpload;
 if(allowedExtentions.includes(file.mimetype)){
   cb(null, true)
 }else{
 cb('Doc type not supported', false);
 }

}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.fileUpload.tempDirectory)
  },
  filename: function (req, file, cb) {
    let fileName = '';
    const ext = path.extname(file.originalname);
    if (req.body.name) {
      fileName = req.body.name + ext;
    } else {
      fileName = file.originalname + ext;
    }

    cb(null, fileName)
    req.body.fileName = `${config.fileUpload.tempDirectory}/${fileName}`;
  }
})
const customerStorage = multer.diskStorage({
  destination : function (req, file, cb){
    cb( null, `uploads/${config.fileUpload.customerUploadDirectory}`)
  },
  filename: function (req, file, cb) {
    let fileName = '';
    const ext = path.extname(file.originalname);
    if (req.body.name) {
      fileName = req.body.name + ext;
    } else {
      fileName = file.originalname;
    }

    cb(null, fileName)
    req.body.fileUrl = `uploads/${config.fileUpload.customerUploadDirectory}/${fileName}`;
    req.body.fileName = fileName;
  },
})

export const upload = multer({ storage: storage })
export const customerUpload = multer({storage:customerStorage, fileFilter})
