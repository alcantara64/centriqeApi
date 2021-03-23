import AppUser from '../models/AppUser';

interface ICrudService {

  createOne(appUser: AppUser, payload: any): Promise<any>;
  createMany(appUser: AppUser, payload: Array<any>): Promise<any>;

  readOneById(appUser: AppUser, id: string): Promise<any>;
  readMany(appUser: AppUser, query?: any): Promise<any>;
  updateOneById(appUser: AppUser, id: string, payload: any): Promise<any>;
  updateMany(appUser: AppUser, payload: Array<any>): Promise<any>;
  deleteOneById(appUser: AppUser, id: string): Promise<any>;

  searchByQuery(appUser: AppUser, query: any): Promise<any>;
  getSearchFilterDataBasedOnConfig(appUser: AppUser, holdingOrgId: string): Promise<any>; //new implementation

  searchByFilterCriteria(appUser: AppUser, queryOpts: any): Promise<any>;

}

export default ICrudService

/** Defining global search type*/
export type globalSearch = {
  fieldNames: string[],
  searchValue: string
}

export type SearchQueryOps = {
  options: {
    offset: number,
    limit: number,
    globalSearch: globalSearch,//2021-01-31 dynamic globalSearch bucket
    sort: string//2021-01-31 dynamic sort bucket
  },
  query: any
}
