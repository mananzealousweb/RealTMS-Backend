import { db } from "../config/database";
import Comment from "../models/Comment";
import Task from "../models/Task";
import { NotFoundError, ForbiddenError } from "../utils/Apperror";

class CommentService {
  /**
   * ➕ Add comment to any task
   */
  static async create(userId: number, taskId: number, comment: string) {
    return await db.transaction(async (t) => {
      const task = await Task.findByPk(taskId, { transaction: t });

      if (!task) {
        throw new NotFoundError({ message: "Task not found" });
      }

      const newComment = await Comment.create(
        {
          user_id: userId,
          task_id: taskId,
          comment,
        },
        { transaction: t }
      );

      return newComment;
    });
  }

  /**
   * 📄 Get all comments for a task
   */
  static async getByTask(taskId: number) {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new NotFoundError({ message: "Task not found" });
    }

    return await Comment.findAll({
      where: { task_id: taskId },
      order: [["created_at", "ASC"]],
      include: [
        {
          association: "author",
          attributes: ["first_name", "last_name"],
        },
      ],
    });
  }

  /**
   * ✏️ Update comment (ONLY owner)
   */
  static async update(commentId: number, userId: number, comment: string) {
    return await db.transaction(async (t) => {
      const existingComment = await Comment.findByPk(commentId, {
        transaction: t,
      });

      if (!existingComment) {
        throw new NotFoundError({ message: "Comment not found" });
      }

      if (existingComment.user_id !== userId) {
        throw new ForbiddenError({
          message: "You are not allowed to edit this comment",
        });
      }

      if (!existingComment.canEdit(5)) {
        throw new ForbiddenError({
          message: "You can only edit a comment within 5 minutes of posting",
        });
      }

      await existingComment.update({ comment }, { transaction: t });

      return existingComment;
    });
  }

  /**
   * 🗑 Delete comment (ONLY owner)
   */
  static async delete(commentId: number, userId: number) {
    return await db.transaction(async (t) => {
      const existingComment = await Comment.findByPk(commentId, {
        transaction: t,
      });

      if (!existingComment) {
        throw new NotFoundError({ message: "Comment not found" });
      }

      if (existingComment.user_id !== userId) {
        throw new ForbiddenError({
          message: "You are not allowed to delete this comment",
        });
      }

      await existingComment.destroy({ transaction: t });
      return true;
    });
  }
}

export default CommentService;
