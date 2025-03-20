import { check } from 'express-validator'
import { Restaurant } from '../../models/models.js'

const checkRestaurantExists = async (value, { req }) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant === null) {
      return Promise.reject(new Error('The restaurantId does not exist.'))
    } else { return Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}
const create = [
  check('stars').exists().isInt({ min: 0, max: 5 }).toInt(),
  check('body').optional({ nullable: true, checkFalsy: true }).isString().trim(),
  check('restaurantId').exists({ checkNull: true }).isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('userId').not().exists()
]
const update = [
  check('stars').exists().isInt({ min: 0, max: 5 }).toInt(),
  check('body').optional({ nullable: true, checkFalsy: true }).isString().trim(),
  check('restaurantId').exists({ checkNull: true }).isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('userId').not().exists()
]

export { create, update }
