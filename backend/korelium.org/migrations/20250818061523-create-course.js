'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      tags: {
        type: Sequelize.JSON
      },
      instructor: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.STRING
      },
      students: {
        type: Sequelize.INTEGER
      },
      rating: {
        type: Sequelize.FLOAT
      },
      udemyLink: {
        type: Sequelize.STRING
      },
      fullDescription: {
        type: Sequelize.TEXT
      },
      prerequisites: {
        type: Sequelize.STRING
      },
      level: {
        type: Sequelize.STRING
      },
      language: {
        type: Sequelize.STRING
      },
      lastUpdated: {
        type: Sequelize.STRING
      },
      certificate: {
        type: Sequelize.BOOLEAN
      },
      whatYoullLearn: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Courses');
  }
};