import AppException from '../../exceptions/AppException';
import HttpMethodNotAllowException from '../../exceptions/http/HttpMethodNotAllowException';
import AppUser from '../models/AppUser';
import { SearchQueryOps } from './ICrudService';
import AServiceBase from './AServiceBase';
import ICrudService from "./ICrudService";
import IServiceBase from "./IServiceBase";






abstract class AReadService extends AServiceBase implements IServiceBase, ICrudService {


  /**
   *
   * @param model The mongoose model
   * @param loggerString Returned string will be used to build up logger information. Example "modules.customer.CustomerService"
   * @param grantingPrivileges The granting privileges.
   */
  constructor(loggerString: string) {
    super(loggerString);
  }


  /**
   * Creates one item in the database.
   * @param userSecurity The user's row level security information.
   * @param payload
   */
  public async createOne(appUser: AppUser, payload: any): Promise<any> {
    throw new AppException("Method not supported");
  }

  public async createMany(appUser: AppUser, payload: Array<any>): Promise<any> {
    throw new AppException("Method not supported");
  }

  public abstract readOneById(appUser: AppUser, id: string): Promise<any>;
  public abstract readMany(appUser: AppUser, opts: any): Promise<any>;

  public async updateOneById(appUser: AppUser, id: string, payload: any): Promise<any> {
    throw new AppException("Method not supported");
  }

  public async updateMany(appUser: AppUser, payload: Array<any>): Promise<any> {
    throw new AppException("Method not supported");
  }

  public async deleteOneById(appUser: AppUser, id: string): Promise<any> {
    throw new AppException("Method not supported");
  }


  public async searchByFilterCriteria(appUser: AppUser, queryOpts: any): Promise<any> {
    throw new AppException("Method not supported");
  }

  public async searchByQuery(appUser: AppUser, queryOpts: SearchQueryOps): Promise<any> {
    throw new AppException("Method not supported");
  }

  /**
   * Overwrite this to enable search route.
   */
  protected getFieldNamesForSearch(): Array<string> {
    throw new HttpMethodNotAllowException("This method is not implemented for this resource.");
  }

  async getSearchByQueryFilterData(appUser: AppUser) {
    throw new AppException("Method not supported");
  }

  async getSearchFilterDataBasedOnConfig(appUser: AppUser) {
    throw new AppException("Method not supported");
  }


}

export default AReadService
