"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("comments", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },

      task_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },

      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("comments", ["task_id"]);
    await queryInterface.addIndex("comments", ["user_id"]);

    await queryInterface.addConstraint("comments", {
      fields: ["task_id"],
      type: "foreign key",
      name: "fk_comment_task",
      references: {
        table: "tasks",
        field: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("comments", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_comment_user",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("comments");
  },
};
