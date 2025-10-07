import { check, param } from "express-validator";

export const addReviewValidator = [
  check('product').trim().not().isEmpty().withMessage('product is required').isString().isMongoId().withMessage("Invalid id"),
  check('rating').trim().escape().not().isEmpty().withMessage('rating is required').isFloat({ min: 0, max: 5 }).withMessage("Invalid Rating type"),
  // check('image').notEmpty().withMessage('Image is requires'),
  // check('category').trim().not().isEmpty().withMessage('category is required').isString(),
  check('comment').trim().not().isEmpty().withMessage('comment is required').isString(),
]

export const reviewsParamValidator = [
     param('id').trim().not().isEmpty().withMessage('param is required').isString().isMongoId().withMessage("Invalid id"),
]