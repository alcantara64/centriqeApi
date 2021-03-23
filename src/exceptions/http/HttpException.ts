import AppException from "../AppException";


class HttpException extends AppException {
  httpStatus: number;


  constructor(httpStatus: number, message: string, details?: string) {
    super(message, details);
    this.name = "HttpException";
    this.httpStatus = httpStatus;
  }
}

export default HttpException;
