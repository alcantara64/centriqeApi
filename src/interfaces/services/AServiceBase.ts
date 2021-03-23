import IServiceBase from "./IServiceBase";


abstract class AServiceBase implements IServiceBase {


  constructor(
    protected loggerString: string
  ) {

  }

}

export default AServiceBase
