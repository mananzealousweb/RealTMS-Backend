"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("authorizations", {
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

      access_token: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },

      refresh_token: {
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

    await queryInterface.addIndex("authorizations", ["access_token"]);
    await queryInterface.addIndex("authorizations", ["refresh_token"]);

    await queryInterface.addConstraint("authorizations", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_auth_user",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("authorizations");
  },
};
