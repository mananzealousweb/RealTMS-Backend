import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize";
import { decrypt, encrypt } from "../utils/helper";

class Authorization extends Model {
  declare id: number;
  declare user_id: number;
  declare access_token: string;
  declare refresh_token: string;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  static initModel(sequelize: Sequelize): ModelStatic<Authorization> {
    Authorization.init(
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
        access_token: {
          type: DataTypes.STRING(500),
          allowNull: false,
          set(value: string | null) {
            if (!value) {
              this.setDataValue("access_token", null);
            } else {
              const encrypted = encrypt(value);
              this.setDataValue("access_token", encrypted);
            }
          },
          get() {
            const storedValue = this.getDataValue("access_token");
            if (!storedValue) return null;
            return decrypt(storedValue);
          },
        },
        refresh_token: {
          type: DataTypes.STRING(500),
          allowNull: false,
          set(value: string | null) {
            if (!value) {
              this.setDataValue("refresh_token", null);
            } else {
              const encrypted = encrypt(value);
              this.setDataValue("refresh_token", encrypted);
            }
          },
          get() {
            const storedValue = this.getDataValue("refresh_token");
            if (!storedValue) return null;
            return decrypt(storedValue);
          },
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
        tableName: "authorizations",
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
      as: "user",
    });
  }
}

export default Authorization;
