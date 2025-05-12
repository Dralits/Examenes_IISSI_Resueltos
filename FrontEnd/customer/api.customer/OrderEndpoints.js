import { get, put, destroy, post } from './helpers/ApiRequestsHelper'

function getAll(){
    return get('orders')
}

function getDetail (id) {
    return get(`orders/${id}`)
}

function putOrder(id, data){
    return put(`orders/${id}`, data)
}

function postOrder(orderData){
    return post(`orders`, orderData)
}

function deleteOrder(id){
    return destroy(`orders/${id}`)
}

export { getAll, getDetail, putOrder, deleteOrder, postOrder}

