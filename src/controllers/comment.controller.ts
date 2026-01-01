import { Request, Response, NextFunction } from "express";
import CommentService from "../services/comment.service";
import { CREATE_COMMENT_SCHEMA, UPDATE_COMMENT_SCHEMA } from "../utils/validationSchema";
import { handleError } from "../utils/errorHandler";

export const commentController = {
  /**
   * ➕ Add comment
   */
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CREATE_COMMENT_SCHEMA.validate(req.body, {
        abortEarly: false,
      });

      const { task_id, comment } = req.body;

      const newComment = await CommentService.create(
        req.user!.user_id,
        task_id,
        comment
      );

      return res.status(201).json({
        success: true,
        message: "Comment added successfully",
        comment: newComment,
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },

  /**
   * 📄 Get comments by task
   */
  getByTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);

      const comments = await CommentService.getByTask(taskId);

      return res.status(200).json({
        success: true,
        comments,
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },

  /**
   * ✏️ Update comment
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UPDATE_COMMENT_SCHEMA.validate(req.body, {
        abortEarly: false,
      });

      const commentId = Number(req.params.id);
      const { comment } = req.body;

      const updatedComment = await CommentService.update(
        commentId,
        req.user!.user_id,
        comment
      );

      return res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        comment: updatedComment,
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },

  /**
   * 🗑 Delete comment
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = Number(req.params.id);

      await CommentService.delete(commentId, req.user!.user_id);

      return res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },
};
