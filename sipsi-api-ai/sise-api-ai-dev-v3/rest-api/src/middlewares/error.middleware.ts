import { Response, Request, NextFunction } from "express";
import { ZodError } from "zod";
// import { ResponseError } from "../error/response-error";

class ResponseError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
  }
}

export const errorMiddleware = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // error from zod validation
  if (error instanceof ZodError) {
    res.status(400).json({
      errors: `Validation Error : ${JSON.stringify(error)}`,
    });
    // custom error
  } else if (error instanceof ResponseError) {
    res.status(error.status).json({
      errors: error.message,
    });
  } else {
    res.status(500).json({
      errors: error.message,
    });
  }
};
