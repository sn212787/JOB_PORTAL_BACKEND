class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
  
    //this error comes from database with this code when same values exists like same email from two different persons
    if (err.code === 11000) {
      const message = `Duplicate${Object.keys(err.keyValue)} Entered`;
      err = new ErrorHandler(message, 400);
    }
  
    if (err.name === "JsonWebTokenError") {
      const message = "Json web Token is Invalid, Try Again!";
      err = new ErrorHandler(message, 400);
    }
  
    if (err.name === "TokenExpiredError") {
      const message = "Json web Token is Expired, Try Again!";
      err = new ErrorHandler(message, 400);
    }
  
    //it will come when type Error is come or any other mis match data will come
    if (err.name === "CastError") {
      const message = `Invalid${err.path}`;
      err = new ErrorHandler(message, 400);
    }
  
  // when we want just error msg only not the value of error just our defined message
    const errorMessage = err.errors ? Object.values(err.errors).map((error) => error.message).join(" ") : err.message
    
    
    return res.status(err.statusCode).json({
      success: false,
      message: errorMessage,
    });
  };
  
  export default ErrorHandler