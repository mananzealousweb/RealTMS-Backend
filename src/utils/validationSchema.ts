import * as Yup from "yup";

export const LOGIN_USER_SCHEMA = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/,
      "Password must contain at least one lowecase character, one uppercase character, one digit and one special character"
    ),
});

export const REGISTER_USER_SCHEMA = Yup.object({
  first_name: Yup.string()
    .required("First name is required")
    .max(100, "First name must be at most 100 characters"),

  last_name: Yup.string()
    .required("Last name is required")
    .max(100, "Last name must be at most 100 characters"),

  age: Yup.number().nullable().min(1, "Age must be a positive number"),

  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/,
      "Password must contain at least one lowercase character, one uppercase character, one digit and one special character"
    ),
});

export const CREATE_TASK_SCHEMA = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .max(255, "Title must be at most 255 characters"),

  description: Yup.string().nullable(),

  status: Yup.string().oneOf(["to_do", "in_progress", "done"]).default("to_do"),

  priority: Yup.string().oneOf(["low", "medium", "high"]).default("medium"),

  due_date: Yup.date().nullable(),
});

export const UPDATE_TASK_SCHEMA = Yup.object({
  title: Yup.string().max(255),
  description: Yup.string().nullable(),
  status: Yup.string().oneOf(["to_do", "in_progress", "done"]),
  priority: Yup.string().oneOf(["low", "medium", "high"]),
  due_date: Yup.date().nullable(),
});

export const CREATE_COMMENT_SCHEMA = Yup.object({
  task_id: Yup.number().required("Task ID is required").positive().integer(),

  comment: Yup.string()
    .required("Comment is required")
    .min(1, "Comment cannot be empty"),
});

export const UPDATE_COMMENT_SCHEMA = Yup.object({
  comment: Yup.string()
    .required("Comment is required")
    .min(1, "Comment cannot be empty"),
});
