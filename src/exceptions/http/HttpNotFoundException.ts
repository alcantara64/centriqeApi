import HttpStatus from "../../enums/HttpStatus";
import HttpException from "./HttpException";

class HttpNotFoundException extends HttpException {

  constructor(message: string, details: string = "") {
    super(HttpStatus.NOT_FOUND.CODE, message, details);
    this.name = "HttpNotFoundException";
  }
}

export default HttpNotFoundException;
