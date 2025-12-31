import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize";

export type MediaType = "image" | "document" | "archive";

class Media extends Model {
  declare id: number;
  declare task_id: number;
  declare type: MediaType;
  declare path: string;

  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  static initModel(sequelize: Sequelize): ModelStatic<Media> {
    Media.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        task_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM("image", "document", "archive"),
          allowNull: false,
        },
        path: {
          type: DataTypes.STRING(500),
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
        tableName: "media",
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
    this.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
    });
  }
}

export default Media;
