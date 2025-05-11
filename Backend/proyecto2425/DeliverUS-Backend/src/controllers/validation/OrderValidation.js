import { Product } from '#root/src/models/models.js'
import { check } from 'express-validator'

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant
const create = [
    check('restaurantId').exists().isInt({ min: 1 }).toInt(),
    check('products').exists().isArray({ min: 1 }).toArray(),
    check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
    check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
    check('products').custom( async (arrayproductos, { req }) => {
        for (const i in arrayproductos){
            const x = arrayproductos[i].productId
            const producto = await Product.findByPk(x)
            if (!producto){
                throw new Error('Product does not exist')
            } else if (producto.availability !== true) {
                throw new Error('Product is not available')
            } else if (req.body.restaurantId !== producto.restaurantId){
                throw new Error('This product is not offered at this restaurant')
            }
        }
    })
]
// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
    check('restaurantId').not().exists(),
    check('products').exists().isArray({ min: 1 }).toArray(),
    check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
    check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
    check('products').custom( async (arrayproductos, { req }) => {
        const restaurantIds = new Set()
        for (const i in arrayproductos){
            const x = arrayproductos[i].productId
            const producto = await Product.findByPk(x)
            if (!producto){
                throw new Error('Product does not exist')
            } else if (producto.availability !== true) {
                throw new Error('Product is not available')
            }
            restaurantIds.add(producto.restaurantId)
        }
        if (restaurantIds.size > 1 ){
            throw new Error('The products are not from the same restaurant')
        }
    })
]

export { create, update }
