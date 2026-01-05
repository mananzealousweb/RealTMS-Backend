import fs from "fs/promises";
import Media from "../models/Media";
import { db } from "../config/database";
import Task from "../models/Task";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../utils/Apperror";
import User from "../models/User";
import Comment from "../models/Comment";
import { cleanupUploadedFiles } from "../utils/helper";
import socketService from "./socket.service";
import { SOCKET_EVENTS } from "../utils/constants";

class TaskService {
  /**
   * ➕ Create Task
   */
  static async create(
    userId: number,
    payload: any,
    files?: Express.Multer.File[]
  ) {
    return await db.transaction(async (t) => {
      try {
        // 🔒 Media limit check (CREATE)
        if (files && files.length > 5) {
          throw new BadRequestError({
            message: "You can attach a maximum of 5 files per task",
          });
        }

        // 1️⃣ Create task
        const task = await Task.create(
          {
            user_id: userId,
            ...payload,
          },
          { transaction: t }
        );

        // 2️⃣ Handle media files
        if (files && files.length > 0) {
          const mediaEntries = files.map((file) => {
            let type: "image" | "document" | "archive" = "document";

            if (file.destination.includes("images")) type = "image";
            else if (file.destination.includes("archive")) type = "archive";
            else if (file.destination.includes("docs")) type = "document";

            return {
              task_id: task.id,
              type,
              path: file.path,
            };
          });

          await Media.bulkCreate(mediaEntries, {
            transaction: t,
          });
        }

        // 🔔 EMIT REAL-TIME EVENT: Task Created
        socketService.emit(SOCKET_EVENTS.TASK_CREATED, {
          task,
          createdBy: userId,
          timestamp: new Date().toISOString(),
        });

        return task;
      } catch (error) {
        // 🧹 CLEAN UP FILES IF ANY ERROR OCCURS
        await cleanupUploadedFiles(files);
        throw error; // rethrow so transaction rolls back
      }
    });
  }

  /**
   * 📄 Get All Tasks (All users)
   */
  static async getAll() {
    return await Task.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Media,
          as: "media",
          attributes: ["type", "path", "created_at"],
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "comment", "created_at"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "first_name", "last_name"],
            },
          ],
        },
      ],
      order: [
        ["created_at", "DESC"],
        [{ model: Comment, as: "comments" }, "created_at", "ASC"],
      ],
    });
  }

  /**
   * 📄 Get Task By ID
   */
  static async getById(taskId: number) {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Media,
          as: "media",
          attributes: ["type", "path"],
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "comment", "created_at"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "first_name", "last_name"],
            },
          ],
        },
      ],
      order: [[{ model: Comment, as: "comments" }, "created_at", "ASC"]],
    });

    if (!task) {
      throw new NotFoundError({ message: "Task not found" });
    }

    return task;
  }

  /**
   * ✏️ Update Task (Only Owner)
   */
  static async update(
    taskId: number,
    userId: number,
    payload: any,
    files?: Express.Multer.File[]
  ) {
    return await db.transaction(async (t) => {
      try {
        // 1️⃣ Fetch task
        const task = await Task.findByPk(taskId, { transaction: t });

        if (!task) {
          throw new NotFoundError({ message: "Task not found" });
        }

        if (task.user_id !== userId) {
          throw new ForbiddenError({
            message: "You are not allowed to update this task",
          });
        }

        // 2️⃣ Normalize remove_media
        let { remove_media } = payload;

        if (typeof remove_media === "string") {
          try {
            remove_media = JSON.parse(remove_media);
          } catch {
            remove_media = [remove_media];
          }
        }

        if (!Array.isArray(remove_media)) {
          remove_media = [];
        }

        // 3️⃣ Fetch existing media count
        const existingMediaCount = await Media.count({
          where: { task_id: taskId },
          transaction: t,
        });

        const removedCount = remove_media.length;
        const newFilesCount = files?.length || 0;

        const finalMediaCount =
          existingMediaCount - removedCount + newFilesCount;

        // 🔒 MEDIA LIMIT CHECK
        if (finalMediaCount > 5) {
          throw new BadRequestError({
            message: "You can attach a maximum of 5 files per task",
          });
        }

        // 4️⃣ Update task fields
        const { remove_media: _, ...taskPayload } = payload;
        await task.update(taskPayload, { transaction: t });

        // 5️⃣ Remove selected media
        if (remove_media.length > 0) {
          const mediaToRemove = await Media.findAll({
            where: {
              task_id: taskId,
              path: remove_media,
            },
            transaction: t,
          });

          for (const media of mediaToRemove) {
            try {
              await fs.unlink(media.path);
            } catch (err) {
              console.error("[FILE DELETE ERROR]", media.path, err);
            }
          }

          await Media.destroy({
            where: {
              task_id: taskId,
              path: remove_media,
            },
            transaction: t,
          });
        }

        // 6️⃣ Add new uploaded files
        if (files && files.length > 0) {
          const mediaEntries = files.map((file) => {
            let type: "image" | "document" | "archive" = "document";

            if (file.destination.includes("images")) type = "image";
            else if (file.destination.includes("archive")) type = "archive";
            else if (file.destination.includes("docs")) type = "document";

            return {
              task_id: taskId,
              type,
              path: file.path,
            };
          });

          await Media.bulkCreate(mediaEntries, { transaction: t });
        }

        // 🔔 EMIT REAL-TIME EVENT: Task Updated
        socketService.emit(SOCKET_EVENTS.TASK_UPDATED, {
          task,
          updatedBy: userId,
          timestamp: new Date().toISOString(),
        });

        return task;
      } catch (error) {
        // 🧹 CLEAN UP FILES IF ANY ERROR OCCURS
        await cleanupUploadedFiles(files);
        throw error; // rethrow so transaction rolls back
      }
    });
  }

  /**
   * 🗑 Delete Task (Only Owner)
   */
  static async delete(taskId: number, userId: number) {
    return await db.transaction(async (t) => {
      // 1️⃣ Fetch task
      const task = await Task.findByPk(taskId, {
        transaction: t,
      });

      if (!task) {
        throw new NotFoundError({ message: "Task not found" });
      }

      if (task.user_id !== userId) {
        throw new ForbiddenError({
          message: "You are not allowed to delete this task",
        });
      }

      // 2️⃣ Fetch related media
      const mediaList = await Media.findAll({
        where: { task_id: taskId },
        transaction: t,
      });

      // 3️⃣ Delete physical files (best effort)
      for (const media of mediaList) {
        try {
          await fs.unlink(media.path);
        } catch (err) {
          // ⚠️ Log but do NOT crash transaction
          console.error("[FILE DELETE ERROR]", media.path, err);
        }
      }

      // 4️⃣ Delete media records (soft delete)
      if (mediaList.length > 0) {
        await Media.destroy({
          where: { task_id: taskId },
          transaction: t,
        });
      }

      await Comment.destroy({
        where: { task_id: taskId },
        transaction: t,
      });

      // 5️⃣ Delete task (soft delete)
      await task.destroy({ transaction: t });

      // 🔔 EMIT REAL-TIME EVENT: Task Deleted
      socketService.emit(SOCKET_EVENTS.TASK_DELETED, {
        taskId,
        deletedBy: userId,
        timestamp: new Date().toISOString(),
      });

      return true;
    });
  }
}

export default TaskService;
