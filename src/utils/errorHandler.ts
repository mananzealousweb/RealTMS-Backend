import { Request, Response, NextFunction } from "express";
import { ValidationError as YupValidationError } from "yup";
import { AppError, ERRORS } from "./Apperror";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

/**
 * ✅ Basic Global Error Handler
 * Handles:
 * - AppError (custom)
 * - Yup validation errors
 * - Sequelize errors
 * - Plain JS Error
 * - Unknown thrown values
 */
export const handleError = (
  err: any,
  req: AuthenticatedRequest | Request,
  res: Response,
  next: NextFunction
) => {
  let error: AppError;

  /**
   * 1️⃣ Already normalized AppError
   */
  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof YupValidationError) {
    /**
     * 2️⃣ Yup validation error
     */
    error = new AppError({
      ...ERRORS.VALIDATION_FAILED,
      info: err.inner?.length
        ? err.inner.map((e) => ({
            field: e.path,
            message: e.message,
          }))
        : [{ field: err.path, message: err.message }],
    });
  } else if (err?.name?.startsWith("Sequelize")) {
    /**
     * 3️⃣ Sequelize / DB errors
     */
    error = new AppError({
      ...ERRORS.DB_ERROR,
      message: err.message,
      info: err.errors || null,
    });
  } else if (err instanceof Error) {
    /**
     * 4️⃣ Plain JS Error
     */
    error = new AppError({
      ...ERRORS.INTERNAL_ERROR,
      message: err.message,
    });
  } else {
    /**
     * 5️⃣ Unknown error (object / string / number)
     */
    error = new AppError({
      ...ERRORS.INTERNAL_ERROR,
      message: "Something went wrong",
      info: err,
    });
  }

  res.status(error.status).json(error.toJSON());
};
