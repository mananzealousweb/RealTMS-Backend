import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize";

class Comment extends Model {
  declare id: number;
  declare user_id: number;
  declare task_id: number;
  declare comment: string;

  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  static initModel(sequelize: Sequelize): ModelStatic<Comment> {
    Comment.init(
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
        task_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: false,
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
        tableName: "comments",
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
      as: "author",
    });

    this.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
    });
  }

  // Helpers
  canEdit(minutes = 5): boolean {
    if (!this.created_at) return false;
    const diff = (Date.now() - new Date(this.created_at).getTime()) / 1000 / 60;
    return diff <= minutes;
  }
}

export default Comment;
