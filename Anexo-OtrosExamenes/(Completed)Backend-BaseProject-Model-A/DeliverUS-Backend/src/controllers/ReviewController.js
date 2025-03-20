import { Review } from '../models/models.js'

const ReviewController = {

  async index (req, res) {
    try {
      const reviews = await Review.findAll({
        where: {
          restaurantId: req.params.restaurantId
        }
      })
      res.json(reviews)
    } catch (err) {
      res.status(500).send(err)
    }
  },

  async create (req, res) {
    let newReview = Review.build(req.body)
    try {
      newReview = await newReview.save()
      res.json(newReview)
    } catch (err) {
      res.status(500).send(err)
    }
  },

  async update (req, res) {
    try {
      await Review.update(req.body, { where: { id: req.params.reviewId } })
      const updatedReview = await Review.findByPk(req.params.reviewId)
      res.json(updatedReview)
    } catch (err) {
      res.status(500).send(err)
    }
  },

  async destroy (req, res) {
    try {
      const result = await Review.destroy({ where: { id: req.params.reviewId } })
      let message = ''
      if (result === 1) {
        message = 'Sucessfuly deleted review id.' + req.params.reviewId
      } else {
        res.status(404).send('Review already deleted')
      }
      res.json(message)
    } catch (err) {
      res.status(500).send(err)
    }
  }

}

export default ReviewController
