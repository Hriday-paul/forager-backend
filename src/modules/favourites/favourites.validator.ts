import { check } from "express-validator";

export const addFavouriteValidator = [
  check('product').trim().not().isEmpty().withMessage('product is required').isMongoId().withMessage("product id is invalid"),
]