
import { getLoggedInOwner, getLoggedInCustomer } from './utils/auth'
import { getFirstRestaurantOfOwner } from './utils/restaurant'
import { getOrderList } from './utils/order'
import { getApp, shutdownApp } from './utils/testApp'


import request from 'supertest'
import timekeeper from 'timekeeper'

/* let totalScore = 0 // Variable global para mantener la puntuación

const testWeights = {
  'Get all orders (ordered) Should return 401 if not logged in': 0.25,
  'Get all orders (ordered) Should return 403 if logged in as customer': 0.25,
  'Get all orders (ordered) Should return 200 if logged in as owner': 0.25,
  'Get all orders (ordered) All orders must belong to the restaurant': 0.25,
  'Get all orders (ordered) All orders must have a user': 0.25,
  'Get all orders (ordered) This endpoint should return all the orders ordered by status (pending, in process, sent and delivered)': 1,
  'Backward Should return 401 if not logged in': 0.25,
  'Backward Should return 403 if logged in as customer': 0.25,
  'Backward Should return 409 if logged in as owner and order does not exists': 0.25,
  'Backward Should return 409 if logged in as owner and order is pending': 0.75,
  'Backward Should return 409 when try to go backwards after 5 minutes': 1,
  'Backward Should return 200 if everything is ok': 1,
  'Forward Should return 401 if not logged in': 0.25,
  'Forward Should return 403 if logged in as customer': 0.25,
  'Forward Should return 409 if logged in as owner and order does not exists': 0.25,
  'Forward Should return 409 if logged in as owner and order is delivered': 0.75,
  'Forward Should return 200 if everything is ok': 1
}

// Este bloque global maneja la puntuación a través de todas las suites
afterEach(() => {
  const testState = expect.getState()
  const testName = testState.currentTestName
  if (testWeights[testName]) {
    totalScore += testWeights[testName] * testState.numPassingAsserts / testState.assertionCalls
  } else {
    console.error('Weight not found', testName)
  }
})

// Imprime la puntuación total después de todas las pruebas
afterAll(() => {
  console.info(`Total Score: ${totalScore}`)
}) */

describe('Get all orders (ordered)', () => {
  let restaurant, orders, owner, customer, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
    restaurant = await getFirstRestaurantOfOwner(owner)
    orders = await getOrderList(owner, restaurant)
  })

  it('Should return 401 if not logged in', async () => {
    const response = (await request(app).get(`/restaurants/${restaurant.id}/orders`).send())
    expect(response.status).toBe(401)
  })
  it('Should return 403 if logged in as customer', async () => {
    const response = (await request(app).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${customer.token}`).send())
    expect(response.status).toBe(403)
  })
  it('Should return 200 if logged in as owner', async () => {
    const response = (await request(app).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${owner.token}`).send())
    expect(response.status).toBe(200)
  })
  it('All orders must have a user', async () => {
    expect(orders.every(order => order.user !== undefined)).toBe(true)
  })
  it('All orders must belong to the restaurant', async () => {
    expect(orders.every(order => order.restaurantId === restaurant.id)).toBe(true)
  })
  it('This endpoint should return all the orders ordered by status (pending, in process, sent and delivered)', async () => {
    // check each element of the array, individually
    expect(orders.map(el => el.status)).toEqual(['pending', 'in process', 'sent', 'delivered'])
  })

  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Backward', () => {
  let owner, customer, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
  })
  it('Should return 401 if not logged in', async () => {
    const response = (await request(app).patch('/orders/1/backward').send())
    expect(response.status).toBe(401)
  })
  it('Should return 403 if logged in as customer', async () => {
    const response = (await request(app).patch('/orders/1/backward').set('Authorization', `Bearer ${customer.token}`).send())
    expect(response.status).toBe(403)
  })
  it('Should return 409 if logged in as owner and order does not exists', async () => {
    const response = (await request(app).patch('/orders/1000/backward').set('Authorization', `Bearer ${owner.token}`).send())
    expect(response.status).toBe(404)
  })
  it('Should return 409 if logged in as owner and order is pending', async () => {
    const response = (await request(app).patch('/orders/1/backward').set('Authorization', `Bearer ${owner.token}`).send())
    expect(response.status).toBe(409)
  })
  it('Should return 409 when try to go backwards after 5 minutes', async () => {
    const MS_PER_MINUTE = 60000
    const futureDate = new Date(Date.now() + 5 * MS_PER_MINUTE)
    timekeeper.travel(futureDate)
    const response = (await request(app).patch('/orders/4/backward').set('Authorization', `Bearer ${owner.token}`).send())
    expect(response.status).toBe(409)
    timekeeper.reset()
  })
  it('Should return 200 if everything is ok', async () => {
    const response = (await request(app).patch('/orders/4/backward').set('Authorization', `Bearer ${owner.token}`).send())
    expect(response.status).toBe(200)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Forward', () => {
  let owner, customer, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
  })
  it('Should return 401 if not logged in', async () => {
    const response = (await request(app).patch('/orders/2/forward').send())
    expect(response.status).toBe(401)
  })
  it('Should return 403 if logged in as customer', async () => {
    const response = (await request(app).patch('/orders/2/forward').set('Authorization', `Bearer ${customer.token}`).send())
    expect(response.status).toBe(403)
  })
  it('Should return 409 if logged in as owner and order does not exists', async () => {
    const response = (await request(app).patch('/orders/1000/forward').set('Authorization', `Bearer ${owner.token}`).send())
    expect(response.status).toBe(404)
  })
  it('Should return 409 if logged in as owner and order is delivered', async () => {
    const response = (await request(app).patch('/orders/6/forward').set('Authorization', `Bearer ${owner.token}`).send())
    expect(response.status).toBe(409)
  })
  it('Should return 200 if everything is ok', async () => {
    const response = (await request(app).patch('/orders/3/forward').set('Authorization', `Bearer ${owner.token}`).send())
    expect(response.status).toBe(200)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})
