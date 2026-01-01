import fs from "fs/promises";
import Media from "../models/Media";
import { db } from "../config/database";
import Task from "../models/Task";
import { NotFoundError, ForbiddenError } from "../utils/Apperror";

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
      // 1️⃣ Create task
      const task = await Task.create(
        {
          user_id: userId,
          ...payload,
        },
        { transaction: t }
      );

      // 2️⃣ Handle media files (if any)
      if (files && files.length > 0) {
        const mediaEntries = files.map((file) => {
          let type: "image" | "document" | "archive" = "document";

          if (file.destination.includes("images")) {
            type = "image";
          } else if (file.destination.includes("archive")) {
            type = "archive";
          } else if (file.destination.includes("docs")) {
            type = "document";
          }

          return {
            task_id: task.id,
            type,
            path: file.path, // store full local path
          };
        });

        await Media.bulkCreate(mediaEntries, {
          transaction: t,
        });
      }

      return task;
    });
  }

  /**
   * 📄 Get All Tasks (All users)
   */
  static async getAll() {
    return await Task.findAll({
      include: [
        {
          model: Media,
          as: "media",
          attributes: ["type", "path"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * 📄 Get Task By ID
   */
  static async getById(taskId: number) {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Media,
          as: "media",
          attributes: ["type", "path"],
        },
      ],
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

      // 2️⃣ Update task fields (excluding remove_media)
      let { remove_media } = payload;

      if (typeof remove_media === "string") {
        try {
          remove_media = JSON.parse(remove_media);
        } catch {
          remove_media = [remove_media];
        }
      }
      const { ...taskPayload } = payload;
      await task.update(taskPayload, { transaction: t });

      // 3️⃣ Remove selected media
      if (Array.isArray(remove_media) && remove_media.length > 0) {
        const mediaToRemove = await Media.findAll({
          where: {
            task_id: taskId,
            path: remove_media,
          },
          transaction: t,
        });

        for (const media of mediaToRemove) {
          try {
            await fs.unlink(media.path); // delete physical file
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

      // 4️⃣ Add new uploaded files
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

      return task;
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

      // 5️⃣ Delete task (soft delete)
      await task.destroy({ transaction: t });

      return true;
    });
  }
}

export default TaskService;
