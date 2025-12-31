"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("media", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      task_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("image", "document", "archive"),
        allowNull: false,
      },

      path: {
        type: Sequelize.STRING(500),
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

    await queryInterface.addIndex("media", ["task_id"]);

    await queryInterface.addConstraint("media", {
      fields: ["task_id"],
      type: "foreign key",
      name: "fk_media_task",
      references: {
        table: "tasks",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("media");
  },
};
