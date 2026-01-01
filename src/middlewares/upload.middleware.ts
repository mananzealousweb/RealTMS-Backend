import multer, { MulterError } from "multer";
import path from "path";
import fs from "fs";
import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_FILES_PER_TASK,
} from "../utils/constants";
import { BadRequestError } from "../utils/Apperror";
import { NextFunction } from "express";
import { handleError } from "../utils/errorHandler";

// 📂 Ensure base upload folder exists
const UPLOAD_BASE_PATH = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_BASE_PATH)) {
  fs.mkdirSync(UPLOAD_BASE_PATH, { recursive: true });
}

const getFolderByExtension = (
  ext: string
): keyof typeof ALLOWED_FILE_EXTENSIONS | null => {
  for (const [folder, extensions] of Object.entries(ALLOWED_FILE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return folder as keyof typeof ALLOWED_FILE_EXTENSIONS;
    }
  }
  return null;
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const folder = getFolderByExtension(ext);

    if (!folder) {
      return cb(
        new BadRequestError({
          message: "Invalid file type",
        }) as any,
        ""
      );
    }

    const uploadPath = path.join(
      UPLOAD_BASE_PATH,
      "tasks",
      folder // images | docs | archive
    );

    // ✅ Auto-create folder
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitized = file.originalname.replace(/\s+/g, "_");
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const folder = getFolderByExtension(ext);

  if (!folder) {
    return cb(
      new BadRequestError({
        message: `Invalid file type. Allowed:
Images: ${ALLOWED_FILE_EXTENSIONS.images.join(", ")}
Docs: ${ALLOWED_FILE_EXTENSIONS.docs.join(", ")}
Archive: ${ALLOWED_FILE_EXTENSIONS.archive.join(", ")}`,
      })
    );
  }

  cb(null, true);
};

export const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_TASK,
  },
}).array("files", MAX_FILES_PER_TASK);

export const uploadTaskFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  multerUpload(req, res, (err: any) => {
    // ✅ Multer specific errors
    try {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_COUNT") {
          throw new BadRequestError({
            message: "You can attach a maximum of 5 files per task",
          });
        }

        if (err.code === "LIMIT_FILE_SIZE") {
          throw new BadRequestError({
            message: "File size exceeds allowed limit",
          });
        }

        throw new BadRequestError({
          message: err.message,
        });
      }

      // ✅ No error → continue
      next();
    } catch (err) {
      handleError(err, req, res, next);
    }
  });
};
