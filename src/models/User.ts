import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize";
import { decrypt, encrypt } from "../utils/helper";

class User extends Model {
  declare id: number;
  declare first_name: string;
  declare last_name: string;
  declare age?: number;
  declare email: string;
  declare password: string;

  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  static initModel(sequelize: Sequelize): ModelStatic<User> {
    User.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        first_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        age: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(191),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          set(value: string | null) {
            if (!value) {
              this.setDataValue("password", null);
            } else {
              const encrypted = encrypt(value);
              this.setDataValue("password", encrypted);
            }
          },
          get() {
            const storedValue = this.getDataValue("password");
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
        tableName: "users",
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
    this.hasOne(models.Authorization, {
      foreignKey: "user_id",
      as: "authorization",
    });

    this.hasMany(models.Task, {
      foreignKey: "user_id",
      as: "tasks",
    });

    this.hasMany(models.Comment, {
      foreignKey: "user_id",
      as: "comments",
    });
  }

  // Helpers
  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}

export default User;
