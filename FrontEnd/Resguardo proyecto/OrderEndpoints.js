import { get, post, put, destroy } from './helpers/ApiRequestsHelper'

function getAll () {
  return get('orders')
}

function getDetail (id) {
  return get(`orders/${id}`)
}

function postOrder (order) {
  return post('orders', order)
} 

function destroyOrder (id) {
  return destroy(`orders/${id}`)
} 

function putOrder (id, data) {
  return put(`orders/${id}`, data)
}

export { getAll, getDetail, postOrder, destroyOrder, putOrder }
