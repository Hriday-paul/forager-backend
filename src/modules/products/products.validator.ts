import { check, query } from "express-validator";

export const addProductValidator = [
  check('title').trim().not().isEmpty().withMessage('title is required').isString(),
  check('price').trim().escape().not().isEmpty().withMessage('Price is required').isFloat().withMessage("Invalid Price type"),
  check('quantity').trim().escape().not().isEmpty().withMessage('stock is required').isNumeric().withMessage("Invalid quantity type"),

  check('details').trim().not().isEmpty().withMessage('details is required').isString(),

  check('category').trim().not().isEmpty().withMessage('category is required').isString().isIn(["womens_clothes", "mens_clothes", "health/beauty", "purses", "accessories"]).withMessage("invalid category type"),
  check('sizes').trim().isArray(),
  check('colors').trim().isArray(),
  check('sub_category').trim().isString(),
  check('brand').trim().isString(),

]

export const productQueryChecker = [
  query("category").trim().optional().isString().isIn(["womens_clothes", "mens_clothes", "health/beauty", "purses", "accessories"]).withMessage("invalid category"),
]

export const boughtValidate = [
  check("type").trim().not().isEmpty().withMessage('feedback type is required').isString().isIn(["available", "unavailable"]).withMessage("invalid feedback type"),
]