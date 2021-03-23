import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import StaticsService from './StaticsService';



class StaticsController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new StaticsService(),
      'modules.statics.StaticsController',
      { create: false, delete: false, readMany: true, readOne: false, search: false, updateMany: false, updateOne: false }
    );
  }

}


export default StaticsController
