import { get } from './helpers/ApiRequestsHelper'

function getProductCategories () {
  return get('productCategories')
}

function getProductPopular () {
  return get('products/popular')
}
export { getProductCategories, getProductPopular }
