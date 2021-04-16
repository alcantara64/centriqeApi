import Privilege from '../../enums/Privilege';
import IServiceBase from '../../interfaces/services/IServiceBase';
import AFileUploadService, { FileUploadParams } from './AFileUploadService';


class CustomerFileUploadService extends AFileUploadService implements IServiceBase {
  static CUSTOMER_FOLDER_NAME: string = "customerUploads"
  constructor() {
    super(
      'modules.file-upload.CustomerFileUploadService',
      {
        createPrivileges: [Privilege.CLIENT_SETUP_EDIT],
        readPrivileges: [
          Privilege.CLIENT_SETUP_VIEW, Privilege.CLIENT_SETUP_EDIT,
          Privilege.COMM_AI_VIEW, Privilege.COMM_AI_EDIT,
          Privilege.RESP_AI_VIEW, Privilege.RESP_AI_EDIT,
          Privilege.NPS_VIEW, Privilege.NPS_EDIT
        ],
        updatePrivileges: [Privilege.CLIENT_SETUP_EDIT],
        deletePrivileges: [Privilege.CLIENT_SETUP_EDIT]
      }
    );

  }


  protected async getFileUploadDetails(payload: any): Promise<FileUploadParams> {
     let nameInBucket = '';
     if(payload.file?.filename as string){
       nameInBucket = `${new Date().toUTCString()}${payload.file?.filename.split('.')[0]}`;
     }
    return {
      bucketSubFolder: CustomerFileUploadService.CUSTOMER_FOLDER_NAME,
      fileNameInBucketNoExtension: nameInBucket
    }

  }


}

export default CustomerFileUploadService
