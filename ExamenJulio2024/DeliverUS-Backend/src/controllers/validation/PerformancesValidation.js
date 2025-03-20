import { check } from 'express-validator'

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

const checkOnlyOneIn6Days = async (value, { req }) => {
    try {   
        const actuacionesRestaurante = await Performances.findAll({where: {restaurantId: req.body.restaurantId}})
        const actuacionesRestauranteEn6Dias = actuacionesRestaurante.filter(actuacion => {
            const fechaActuacion = new Date(actuacion.appointment)
            const fechaNuevaActuacion = new Date(req.body.appointment)
            return Math.abs(fechaActuacion - fechaNuevaActuacion) < 6 * 24 * 60 * 60 * 1000
        })
    }catch(err){
         return Promise.reject(new Error(err))
    }
}

const checkOnlyOneInDay = async (value, { req }) => {
    try {
    let comparacion = false
    const actuacionesDeUnRestaurante = await Performance.findAll({ where: { restaurantId: req.body.restaurantId } })
    for (const p in actuacionesDeUnRestaurante) {
        const fechaDeUnperformance = p.appointment.getTime()
        const fechaACrear = new Date(req.body.appointment).getTime()
        if (fechaDeUnperformance === fechaACrear) {
            comparacion = true
            break
        }
    }
    if(comparacion){
        return Promise.reject(new Error('No puede haber mas de una actuacion en un mismo dia'))
    } else {
        Promise.resolve('OK')
    }
    }catch(err){
        return Promise.reject(new Error(err))
    }
}

const create = [
    check('group').exists().isString().isLength({ min: 1, max: 255 }).trim(),
    check('appoinment').exists().isDate(),
    check('restaurantId').exists().isInt({min: 1}).toInt().custom(checkRestaurantExists).custom(checkOnlyOneIn6Days).custom(checkOnlyOneInDay)
]


export {create}
