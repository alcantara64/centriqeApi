import { FILE_PROCESS_TYPE } from '../../enums/FileUpload';
import { FileUploadModel } from '../../models/file/FileUpload';
import { IGrantingPrivileges } from '../../interfaces/services/ACrudService';
import AServiceBase from '../../interfaces/services/AServiceBase';
import IServiceBase from '../../interfaces/services/IServiceBase';
import logger from '../../lib/logger';


abstract class AFileUploadService extends AServiceBase implements IServiceBase {

  constructor(loggerString: string,
    protected grantingPrivileges: IGrantingPrivileges) {
    super(
      loggerString,
    );
  }

  protected abstract getFileUploadDetails(payload: any): Promise<FileUploadParams>;

  public async uploadFile(payload: {file:File | any, fileName:string, fileProcessType:FILE_PROCESS_TYPE, oracleUrl?:string, size?:number, fileReference?:string}) {
    const details = await this.getFileUploadDetails(payload);

    if (payload.fileName) {
      let fileName: string = payload.fileName;
      logger.debug(`${this.loggerString}:uploadFile::Start - fileName ${fileName}`);
      //const oracleCloud = new OracleCloud();
      //replace fileName with new fileName while keeping the file extension
      const indexOfItem = fileName.indexOf('/');
      fileName = fileName.substring(indexOfItem + 1);
      const lastIndexOfDot = fileName.lastIndexOf(".");
      if (lastIndexOfDot > 0) {
        const fileExtension = fileName.substring(lastIndexOfDot + 1, fileName.length);
        logger.debug(`${this.loggerString}:uploadFile::File extension ${fileExtension}`);
        fileName = `${details.fileNameInBucketNoExtension}.${fileExtension}`
      }      
       payload.size = payload.file.size;
      // payload.fileReference = payload.file.id
      //  payload.oracleUrl = url;
     const newUpload =  new FileUploadModel(payload);
      await newUpload.save();
      logger.debug(`${this.loggerString}:uploadFile::save record in database ${newUpload?.id}`);
      return {
        wasFileUploaded: true,
        bucketUrlToFile: ''
      };
    }
    return {
        wasFileUploaded: false,
        bucketUrlToFile: ''
      }
    

  }
  public async getCustomerFileUploads(payload:{createdBy:string, holdingOrg:string}){
    const {createdBy, holdingOrg} = payload;
   return await FileUploadModel.find({createdBy, holdingOrg});
  }
}

export default AFileUploadService

export type FileUploadParams = {
  bucketSubFolder: string,
  fileNameInBucketNoExtension: string
}
