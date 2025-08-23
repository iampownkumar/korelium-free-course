'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Course.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    category: DataTypes.STRING,
    tags: DataTypes.JSON,
    instructor: DataTypes.STRING,
    duration: DataTypes.STRING,
    students: DataTypes.INTEGER,
    rating: DataTypes.FLOAT,
    udemyLink: DataTypes.STRING,
    fullDescription: DataTypes.TEXT,
    prerequisites: DataTypes.STRING,
    level: DataTypes.STRING,
    language: DataTypes.STRING,
    lastUpdated: DataTypes.STRING,
    certificate: DataTypes.BOOLEAN,
    whatYoullLearn: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};