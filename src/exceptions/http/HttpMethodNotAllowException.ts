import HttpStatus from "../../enums/HttpStatus";
import HttpException from "./HttpException";

class HttpMethodNotAllowedException extends HttpException {

  constructor(message: string, details: string = "") {
    super(HttpStatus.METHOD_NOT_ALLOWED.CODE, message, details);
    this.name = "HttpMethodNotAllowedException";
  }
}

export default HttpMethodNotAllowedException;
