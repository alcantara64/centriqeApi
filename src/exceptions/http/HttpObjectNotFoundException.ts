import HttpStatus from "../../enums/HttpStatus";
import HttpException from "./HttpException";

class HttpObjectNotFoundException extends HttpException {

  constructor(message: string, details: string = "") {
    super(HttpStatus.NOT_FOUND.CODE, message, details);
    this.name = "HttpObjectNotFoundException";
  }
}

export default HttpObjectNotFoundException;
