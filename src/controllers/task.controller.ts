import { Request, Response, NextFunction } from "express";
import { handleError } from "../utils/errorHandler";
import TaskService from "../services/task.service";
import {
  CREATE_TASK_SCHEMA,
  UPDATE_TASK_SCHEMA,
} from "../utils/validationSchema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const taskController = {
  /**
   * ➕ Add Task
   */
  add: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await CREATE_TASK_SCHEMA.validate(req.body, {
        abortEarly: false,
      });

      const task = await TaskService.create(
        req.user!.user_id,
        req.body,
        req.files
      );

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },

  /**
   * 📄 Get All Tasks
   */
  get: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tasks = await TaskService.getAll();

      return res.status(200).json({
        success: true,
        tasks,
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },

  /**
   * 📄 Get Task By ID
   */
  getById: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const taskId = Number(req.params.id);
      const task = await TaskService.getById(taskId);

      return res.status(200).json({
        success: true,
        task,
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },

  /**
   * ✏️ Update Task
   */
  update: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await UPDATE_TASK_SCHEMA.validate(req.body, {
        abortEarly: false,
      });

      const taskId = Number(req.params.id);

      const task = await TaskService.update(
        taskId,
        req.user!.user_id,
        req.body,
        req.files
      );

      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task,
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },

  /**
   * 🗑 Delete Task
   */
  delete: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const taskId = Number(req.params.id);

      await TaskService.delete(taskId, req.user!.user_id);

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },
};

export default taskController;
