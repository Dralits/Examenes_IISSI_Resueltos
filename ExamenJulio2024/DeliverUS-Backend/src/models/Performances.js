import { Model } from 'sequelize'
import moment from 'moment'

const loadModel = (sequelize, DataTypes) => {
  class Performances extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
        Performances.BelongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' })
    }
  }
  Performances.init({
    group: DataTypes.STRING,
    appoinment: DataTypes.DATE,
    restaurantId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Performances'
  })
  return Performances
}
export default loadModel
