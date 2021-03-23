
class HttpStatus {

  public static OK = {
    CODE: 200,
    MESSAGE: 'The request has succeeded.',
  };

  public static BAD_REQUEST = {
    CODE: 400,
    MESSAGE: 'The server could not understand the request.',
  };

  public static UNAUTHORIZED = {
    CODE: 401,
    MESSAGE: 'The requested resource requires an authentication.',
  };

  public static FORBIDDEN = {
    CODE: 403,
    MESSAGE: 'The authentication failed.',
  };

  public static NOT_FOUND = {
    CODE: 404,
    MESSAGE: 'The requested resource not found.',
  };

  public static METHOD_NOT_ALLOWED = {
    CODE: 405,
    MESSAGE: 'The requested method is not allowed for the specified resource',
  };

  public static INTERNAL_SERVER_ERROR = {
    CODE: 500,
    MESSAGE: 'There was an internal server error while processing the request.',
  };

  public static CREATED = {
    CODE: 201,
    MESSAGE: 'New resource was created successfully',
  };

  public static UNPROCESSABLE_ENTITY = {
    CODE: 422,
    MESSAGE: 'Request contains some semantic errors',
  };

  public static NOT_ACCEPTABLE = {
    CODE: 406,
    MESSAGE: 'Oops something went wrong in our server',
  };


}

export default HttpStatus;
