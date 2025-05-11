//import dotenv from 'dotenv'

import { getApp, shutdownApp } from './utils/testApp'
import { getLoggedInCustomer, getLoggedInOwner, getNewLoggedInOwner } from './utils/auth'
import { getFirstRestaurantOfOwner } from './utils/restaurant'

import request from 'supertest'

// dotenv.config()

let totalScore = 0 // Variable global para mantener la puntuación

const testWeights = {  
  'Get restaurant details, then performances Should return 200 if restaurant exists': 0.25,
  'Get restaurant details, then performances This endpoint should return only one performance in the following six days for tested restaurant': 0.75,
  'Get restaurant details, then performances All performances must have an id': 0.25,
  'Get restaurant details, then performances All performances must have a group': 0.25,
  'Get restaurant details, then performances All performances must have an appointment': 0.25,
  'Get all restaurants There must be performances, although being zero-length (in /restaurants endpoint)': 0.75,
  'Get owner restaurants There must be performances, although being zero-length (in /users/myRestaurants endpoint)': 0.75,
  'Create performance Should return 401 if not logged in': 0.25,
  'Create performance Should return 403 when logged in as a customer': 0.25,
  'Create performance Should return 403 when logged in as another owner': 0.25, 
  'Create performance Should return 422 when invalid performance date': 0.5,
  'Create performance Should return 200 when valid performance': 0.5
}

// Este bloque global maneja la puntuación a través de todas las suites
afterEach(() => {
  const testState = expect.getState()
  const testName = testState.currentTestName
  if (testName) {
    totalScore += testWeights[testName] * testState.numPassingAsserts / testState.assertionCalls
  } else {
    console.error('Test not found')
  }
})

// Imprime la puntuación total después de todas las pruebas
afterAll(() => {
  console.info(`Total Score: ${totalScore}`) 
})

describe('Get restaurant details, then performances', () => {
  let restaurant, performances, owner, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
  })
  it('Should return 200 if restaurant exists', async () => {
    const response = (await request(app).get(`/restaurants/${restaurant.id}`).send())
    performances = response.body.performances 
    expect(response.status).toBe(200)
    expect(performances !== undefined).toBe(true)
  })
  it('This endpoint should return only one performance in the following six days for tested restaurant', async () => {
    const numberOfPerfomances = performances.length
    expect(numberOfPerfomances).toBe(2)
  })
  it('All performances must have an id', async () => {
    expect(performances.every(performance => performance.id !== undefined)).toBe(true)
  })
  it('All performances must have a group', async () => {
    expect(performances.every(performance => performance.group !== undefined)).toBe(true)
  })
  it('All performances must have an appointment', async () => {
    expect(performances.every(performance => performance.appointment !== undefined)).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get all restaurants', () => {
  let restaurants, app
  beforeAll(async () => {
    app = await getApp()
    const response = await request(app).get('/restaurants').send()
    restaurants = response.body
  })
  it('There must be performances, although being zero-length (in /restaurants endpoint)', async () => {
    expect(restaurants.every(restaurant => restaurant.performances !== undefined)).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get owner restaurants', () => {
  let owner, ownerRestaurants, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    const response = await request(app).get('/users/myRestaurants').set('Authorization', `Bearer ${owner.token}`).send()
    ownerRestaurants = response.body
  })
  it('There must be performances, although being zero-length (in /users/myRestaurants endpoint)', async () => {
    expect(ownerRestaurants.every(restaurant => restaurant.performances !== undefined)).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Create performance', () => {
  let owner, app, customer, restaurant, validPerformance, invalidPerformance
  beforeAll(async () => {
    app = await getApp()
    
    owner = await getLoggedInOwner()
    
    customer = await getLoggedInCustomer()
    restaurant = await getFirstRestaurantOfOwner(owner)      

    const validAppointment = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    validAppointment.setHours(0,0,0,0)
    validPerformance = {
      group: 'Bob Dylan',
      appointment: validAppointment,
      restaurantId: restaurant.id
    }

    const invalidAppointment = new Date(Date.now() + 24 * 60 * 60 * 1000)
    invalidAppointment.setHours(0,0,0,0)
    invalidPerformance = {
      group: 'Bob Dylan',
      appointment: invalidAppointment,
      restaurantId: restaurant.id
    }            
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).post('/performances').send(validPerformance)
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).post('/performances').set('Authorization', `Bearer ${customer.token}`).send(validPerformance)
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as another owner', async () => {
    const anotherOwner = await getNewLoggedInOwner()
    const response = await request(app).post('/performances').set('Authorization', `Bearer ${anotherOwner.token}`).send(validPerformance)
    expect(response.status).toBe(403)
  })
  it('Should return 422 when invalid performance date', async () => {
    const response = await request(app).post('/performances').set('Authorization', `Bearer ${owner.token}`).send(invalidPerformance)
    expect(response.status).toBe(422)
  })
  it('Should return 200 when valid performance', async () => {
    const response = await request(app).post('/performances').set('Authorization', `Bearer ${owner.token}`).send(validPerformance)
    expect(response.status).toBe(200)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})
  