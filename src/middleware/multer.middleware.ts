import multer from 'multer'
import path from 'path';
import config from '../lib/config'
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       console.log('here')
//       cb(null, '/tmp/uploads')
//     },
//     filename: function (req, file, cb) {
//         let fileName = '';
//         const ext = path.extname(file.originalname);
//         if(req.body.name){
//           fileName = req.body.name + ext;
//         }else{
//           fileName = Date.now() + ext;
//         }
//       cb(null, fileName)
//     },
//   })
// const fileFilter = (req:any, file:any, cb:CallableFunction) =>{
//  const allowedExtentions = ['img/png','img/jpeg'];
//  if(allowedExtentions.includes(file.mimetype)){
//    cb(null, file.mimetype)
//  }
//  cb('Doc type not supported');

// }
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
      fileName = Date.now() + ext;
    }

    cb(null, fileName)
    req.body.fileName = `${config.fileUpload.tempDirectory}/${fileName}`;
  }
})

export const upload = multer({ storage: storage })
