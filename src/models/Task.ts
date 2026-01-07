import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize";

export type TaskStatus = "to_do" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

class Task extends Model {
  declare id: number;
  declare user_id: number;
  declare title: string;
  declare description?: string;
  declare status: TaskStatus;
  declare priority: TaskPriority;
  declare due_date?: Date;

  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  static initModel(sequelize: Sequelize): ModelStatic<Task> {
    Task.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
        },
        status: {
          type: DataTypes.ENUM("to_do", "in_progress", "done"),
          defaultValue: "to_do",
        },
        priority: {
          type: DataTypes.ENUM("low", "medium", "high"),
          defaultValue: "medium",
        },
        due_date: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "tasks",
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
      }
    );

    return this;
  }

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "owner",
    });

    this.hasMany(models.Media, {
      foreignKey: "task_id",
      as: "media",
    });

    this.hasMany(models.Comment, {
      foreignKey: "task_id",
      as: "comments",
    });
  }

  // Helpers
  isDone(): boolean {
    return this.status === "done";
  }
}

export default Task;
