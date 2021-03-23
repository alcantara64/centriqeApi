import HttpStatus from "../../enums/HttpStatus";
import HttpException from "./HttpException";

class HttpUnauthorizedException extends HttpException {

  constructor(message: string, details: string = "") {
    super(HttpStatus.UNAUTHORIZED.CODE, message, details);
    this.name = "HttpNoAccessException";
  }
}

export default HttpUnauthorizedException;
