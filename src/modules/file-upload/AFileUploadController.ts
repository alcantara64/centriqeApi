import { Request, Response, Router } from 'express';
import docMiddleware from '../../middleware/doc.middleware';
import { customerUpload } from '../../middleware/multer.middleware';
import HttpStatus from '../../enums/HttpStatus';
import AControllerBase from '../../interfaces/controllers/AControllerBase';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import AFileUploadService from './AFileUploadService';


abstract class AFileUploadController extends AControllerBase implements IControllerBase {


  constructor(protected service: AFileUploadService, loggerString: string) {
    super(
      loggerString
    );
  }

  initRoutes(router: Router, routeOptions?: any): void {
    router.post('/upload', [customerUpload.single('file'), docMiddleware.documentModifier, docMiddleware.documentCreator], (req: Request, res: Response) => { return this.uploadFile(req, res) });
    router.get('/uploads',  (req: Request, res: Response) => { return this.getUserUploads(req, res) });
  }

  public async uploadFile(req: Request, res: Response): Promise<any> {
    const payload = {...req.body, file:req.file}
    const obj = await this.service.uploadFile(payload);
    if(!obj?.wasFileUploaded){
     res.status(HttpStatus.INTERNAL_SERVER_ERROR.CODE)  
    }
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  protected async getUserUploads(req: Request, res:Response){
    const {id} = req.user as any;
    const {holdingOrg} = req.query as any;
    const uploads = await this.service.getCustomerFileUploads({createdBy:id, holdingOrg });
    res.status(HttpStatus.OK.CODE).json(uploads);
  }

}


export default AFileUploadController
