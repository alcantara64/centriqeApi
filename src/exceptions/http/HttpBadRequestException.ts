import HttpStatus from "../../enums/HttpStatus";
import HttpException from "./HttpException";

class HttpBadRequestException extends HttpException {

  constructor(message: string, details: string = "") {
    super(HttpStatus.BAD_REQUEST.CODE, message, details);
    this.name = "HttpBadRequestException";
  }
}

export default HttpBadRequestException;
