import { Model } from 'sequelize'

const loadModel = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate (models) {
      Review.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurantCategory' })
      Review.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    }
  }
  Review.init({
    stars: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    body: DataTypes.STRING,
    restaurantId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    customerId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  }, {
    sequelize,
    modelName: 'Review'
  })

  return Review
}

export default loadModel
