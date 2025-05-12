import { get } from './helpers/ApiRequestsHelper'

function getRestaurants () {
  return get('restaurants')
}

function getAll () {
  return get('users/myrestaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

function getRestaurantProducts (id) {
  return get(`restaurants/${id}/products`)
}

export { getAll, getDetail, getRestaurantCategories, getRestaurants, getRestaurantProducts}
