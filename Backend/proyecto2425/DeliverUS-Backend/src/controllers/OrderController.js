// eslint-disable-next-line no-unused-vars
import { Order, Product, ProductCategory, Restaurant, RestaurantCategory, User, sequelizeSession } from '../models/models.js'
import moment from 'moment'
import { Op } from 'sequelize'
const generateFilterWhereClauses = function (req) {
  const filterWhereClauses = []
  if (req.query.status) {
    switch (req.query.status) {
      case 'pending':
        filterWhereClauses.push({
          startedAt: null
        })
        break
      case 'in process':
        filterWhereClauses.push({
          [Op.and]: [
            {
              startedAt: {
                [Op.ne]: null
              }
            },
            { sentAt: null },
            { deliveredAt: null }
          ]
        })
        break
      case 'sent':
        filterWhereClauses.push({
          [Op.and]: [
            {
              sentAt: {
                [Op.ne]: null
              }
            },
            { deliveredAt: null }
          ]
        })
        break
      case 'delivered':
        filterWhereClauses.push({
          sentAt: {
            [Op.ne]: null
          }
        })
        break
    }
  }
  if (req.query.from) {
    const date = moment(req.query.from, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.gte]: date
      }
    })
  }
  if (req.query.to) {
    const date = moment(req.query.to, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.lte]: date.add(1, 'days') // FIXME: se pasa al siguiente día a las 00:00
      }
    })
  }
  return filterWhereClauses
}

// Returns :restaurantId orders
const indexRestaurant = async function (req, res) {
  const whereClauses = generateFilterWhereClauses(req)
  whereClauses.push({
    restaurantId: req.params.restaurantId
  })
  try {
    const orders = await Order.findAll({
      where: whereClauses,
      include: {
        model: Product,
        as: 'products'
      }
    })
    res.json(orders)
  } catch (err) {
    res.status(500).send(err)
  }
}

// TODO: Implement the indexCustomer function that queries orders from current logged-in customer and send them back.
// Orders have to include products that belongs to each order and restaurant details
// sort them by createdAt date, desc.
const indexCustomer = async function (req, res) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: { exclude: ['userId'] },
          include: [{ model: RestaurantCategory, as: 'restaurantCategory' }]
        },
        {
          model: Product,
          as: 'products'
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    res.json(orders)
  } catch (err) {
    res.status(500).send(err)
  }
}

// TODO: Implement the create function that receives a new order and stores it in the database.
// Take into account that:
// 1. If price is greater than 10€, shipping costs have to be 0.
// 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
// 3. In order to save the order and related products, start a transaction, store the order, store each product linea and commit the transaction
// 4. If an exception is raised, catch it and rollback the transaction

const create = async (req, res) => {
  // Use sequelizeSession to start a transaction
  const transaction = await sequelizeSession.transaction()
  try {
    const { restaurantId, products, address } = req.body
    const productos = []

    let price = 0 
    for (const { productId, quantity } of products) {
      const product = await Product.findByPk(productId, {transaction})
      productos.push(product)
      price = price + (product.price * quantity)
    }

    let shippingCosts = 0
    if (price <= 10) {
      const restaurant = await Restaurant.findByPk(restaurantId, { transaction })
      shippingCosts = restaurant.shippingCosts
      price = price + shippingCosts
    }
    /*
    let order = await Order.build(
      {
        userId: req.user.id,
        restaurantId,
        address,
        price,
        shippingCosts

      }
    )

    order = await order.save({ transaction }) */

    const order = await Order.create(
      {
        userId: req.user.id,
        restaurantId,
        address,
        price,
        shippingCosts,
        ...req.body // Esto es en caso de que haya mas atributos de Order en el body que no contemplo de primeras
      },
      { transaction }
    )

    for (const product of productos) {
      const quantity = products.find(p => p.productId === product.id).quantity
      await order.addProduct(product, { through: { quantity, unityPrice: product.price }, transaction })
    }

    await transaction.commit()

    const orderWithProducts = await Order.findByPk(order.id, {
      include: [{ model: Product, as: 'products' }]
    })

    res.json(orderWithProducts)
  } catch (err) {
    await transaction.rollback()
    res.status(500).send(err)
  }
}

// TODO: Implement the update function that receives a modified order and persists it in the database.
// Take into account that:
// 1. If price is greater than 10€, shipping costs have to be 0.
// 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
// 3. In order to save the updated order and updated products, start a transaction, update the order, remove the old related OrderProducts and store the new product lines, and commit the transaction
// 4. If an exception is raised, catch it and rollback the transaction
const update = async function (req, res) {
  // Use sequelizeSession to start a transaction
  const transaction = await sequelizeSession.transaction()
  try {
    const { orderId } = req.params
    const { products } = req.body

    const productos = []

    let price = 0
    for (const { productId, quantity } of products) {
      const product = await Product.findByPk(productId)
      productos.push(product)
      price = price + (product.price * quantity)
    }

    let shippingCosts = 0
    if (price <= 10) {
      const restaurant = await Restaurant.findByPk(productos[0].restaurantId, { transaction })
      shippingCosts = restaurant.shippingCosts
      price = price + shippingCosts
    }

    await Order.update(
      { price, shippingCosts, ...req.body }, // req.body explicado en create
      { where: { id: orderId }, transaction }
    )   

    const order = await Order.findByPk(orderId, { transaction })

    await order.setProducts([], { transaction })

    for (const product of productos) {
      const quantity = products.find(p => p.productId === product.id).quantity
      await order.addProduct(product, { through: { quantity, unityPrice: product.price }, transaction })
    }

    await transaction.commit()

    const updatedOrder = await Order.findByPk(orderId, {
      include: [{ model: Product, as: 'products' }]
    })

    res.json(updatedOrder)
  } catch (err) {
    await transaction.rollback()
    res.status(500).send('This function is to be implemented')
  }
}

// TODO: Implement the destroy function that receives an orderId as path param and removes the associated order from the database.
// Take into account that:
// 1. The migration include the "ON DELETE CASCADE" directive so OrderProducts related to this order will be automatically removed.
const destroy = async function (req, res) {
  try {
    const resultado = await Order.destroy({
      where: { id: req.params.orderId }
    })
    let message = ''
    if (resultado === 1) {
      message = 'Sucessfuly deleted order id.' + req.params.restaurantId
    } else {
      message = 'Could not delete order.'
    }
    res.json(message)
  } catch (err) {
    res.status(500).send('This function is to be implemented')
  }
}

const confirm = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.startedAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const send = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.sentAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const deliver = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.deliveredAt = new Date()
    const updatedOrder = await order.save()
    const restaurant = await Restaurant.findByPk(order.restaurantId)
    const averageServiceTime = await restaurant.getAverageServiceTime()
    await Restaurant.update({ averageServiceMinutes: averageServiceTime }, { where: { id: order.restaurantId } })
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const show = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId']
      },
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'email', 'avatar', 'userType']
      },
      {
        model: Product,
        as: 'products'
      }]
    })
    res.json(order)
  } catch (err) {
    res.status(500).send(err)
  }
}

const analytics = async function (req, res) {
  const yesterdayZeroHours = moment().subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const todayZeroHours = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  try {
    const numYesterdayOrders = await Order.count({
      where:
      {
        createdAt: {
          [Op.lt]: todayZeroHours,
          [Op.gte]: yesterdayZeroHours
        },
        restaurantId: req.params.restaurantId
      }
    })
    const numPendingOrders = await Order.count({
      where:
      {
        startedAt: null,
        restaurantId: req.params.restaurantId
      }
    })
    const numDeliveredTodayOrders = await Order.count({
      where:
      {
        deliveredAt: { [Op.gte]: todayZeroHours },
        restaurantId: req.params.restaurantId
      }
    })

    const invoicedToday = await Order.sum(
      'price',
      {
        where:
        {
          createdAt: { [Op.gte]: todayZeroHours }, // FIXME: Created or confirmed?
          restaurantId: req.params.restaurantId
        }
      })
    res.json({
      restaurantId: req.params.restaurantId,
      numYesterdayOrders,
      numPendingOrders,
      numDeliveredTodayOrders,
      invoicedToday
    })
  } catch (err) {
    res.status(500).send(err)
  }
}

const OrderController = {
  indexRestaurant,
  indexCustomer,
  create,
  update,
  destroy,
  confirm,
  send,
  deliver,
  show,
  analytics
}
export default OrderController