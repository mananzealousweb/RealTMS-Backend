"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
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

      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
      },

      status: {
        type: Sequelize.ENUM("to_do", "in_progress", "done"),
        defaultValue: "to_do",
      },

      priority: {
        type: Sequelize.ENUM("low", "medium", "high"),
        defaultValue: "medium",
      },

      due_date: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("tasks", ["status"]);
    await queryInterface.addIndex("tasks", ["priority"]);
    await queryInterface.addIndex("tasks", ["title"]);

    await queryInterface.addConstraint("tasks", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_task_user",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tasks");
  },
};
